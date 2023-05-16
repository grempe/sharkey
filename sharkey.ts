#!/usr/bin/env -S deno run --unstable --allow-env=SEED --allow-write --allow-read

/**
 * Copyright (c) 2023 Glenn Rempe <glenn@rempe.us>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as base64 from "https://deno.land/std@0.185.0/encoding/base64.ts"
import { crypto } from "https://deno.land/std@0.185.0/crypto/mod.ts"
import {
  Command,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.25.7/command/mod.ts"
import {
  prompt,
  Input
} from "https://deno.land/x/cliffy@v0.25.7/prompt/mod.ts"
import { colors } from "https://deno.land/x/cliffy@v0.25.7/ansi/colors.ts"

import {
  base32crockford,
  bech32,
} from "https://esm.sh/@scure/base@1.1.1?pin=v118"

import { generateKeyPairFromSeed } from "https://esm.sh/@stablelib/x25519@1.0.1?pin=v118"
import {
  combine,
  MAX_SHARES,
  readIdentifier,
  readThreshold,
  split,
} from "https://esm.sh/@stablelib/tss@1.0.1?pin=v118"
import { deriveKey } from "https://esm.sh/@stablelib/scrypt@1.0.1?pin=v118"
import { wipe } from "https://esm.sh/@stablelib/wipe@1.0.1?pin=v118"
import { equal } from "https://esm.sh/@stablelib/constant-time@1.0.1?pin=v118"

import {bytesToPassphrase, passphraseToBytes} from "npm:niceware-ts@0.0.5"

const MIN_SHARES = 1
const SEED_LENGTH = 32
const SALT_LENGTH = 16

// RELEASE VERSION : BUMP VERSION HERE
const VERSION = "0.0.4"

const base32CrockfordRegex = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{32,256}$/

/**
 * Converts the timestamp in seconds since epoch to a 16-byte Uint8Array encoding the timestamp and
 * 8 bytes of random data.
 *
 * @param timestamp - The timestamp in milliseconds since the epoch.
 * @returns A 16-byte Uint8Array buffer encoding the Unix timestamp in seconds and 8 bytes of random data.
 */
function generateShareId(timestamp: number): Uint8Array {
  const uint8Array = new Uint8Array(16);
  const seconds = Math.floor(timestamp / 1000);
  uint8Array.set(new Uint8Array(new BigUint64Array([BigInt(seconds)]).buffer), 0);
  uint8Array.set(crypto.getRandomValues(new Uint8Array(8)), 8);
  return uint8Array;
}

function shareIdToDate(shareId: Uint8Array): Date {
  const timestampSeconds = new BigUint64Array(shareId.buffer.slice(0, 8))[0];
  const timestampMilliseconds = Number(timestampSeconds) * 1000;
  return new Date(timestampMilliseconds);
}

/**
 * Generates a Bech32-encoded age identity keypair (X25519) from a 32-byte seed.
 *
 * @param seed - A 32-byte Uint8Array seed for generating the keypair.
 * @returns An object with Bech32-encoded age identity keypair properties: publicKey and secretKey.
 * @throws {Error} If the seed is not exactly 32 bytes long.
 */
function generateAgeIdentityFromSeed(seed: Uint8Array): {
  publicKey: string
  secretKey: string
} {
  if (seed.byteLength !== 32) {
    throw new Error("Seed must be exactly 32 bytes long")
  }

  // Generate keypair using seed
  const { publicKey, secretKey } = generateKeyPairFromSeed(seed)

  // Wipe seed from memory
  wipe(seed)

  // Encode public key as Bech32
  const publicKeyBech32 = bech32.encode("age", bech32.toWords(publicKey))

  // Encode secret key as Bech32 with prefix
  const secretKeyBech32 = bech32.encode(
    "AGE-SECRET-KEY-",
    bech32.toWords(secretKey)
  )

  // Return Bech32-encoded keypair properties
  return {
    publicKey: publicKeyBech32,
    secretKey: secretKeyBech32.toUpperCase(),
  }
}

/**
 * Stretches a 32-byte Uint8Array using the scrypt key derivation function. If provided
 * the same key and salt values the function will always return the same stretched key.
 * @param seed - The 32-byte input key to be stretched.
 * @param salt - The 16-byte salt value to be used for key stretching.
 * @see https://words.filippo.io/the-scrypt-parameters/
 * @returns A Promise that resolves to the 32-byte stretched key.
 */
async function stretchSeed(
  seed: Uint8Array,
  salt: Uint8Array
): Promise<Uint8Array> {
  if (seed.byteLength !== SEED_LENGTH) {
    throw new Error(`Seed must be exactly ${SEED_LENGTH} bytes long`)
  }

  if (salt.byteLength !== SALT_LENGTH) {
    throw new Error(`Salt must be exactly ${SALT_LENGTH} bytes long`)
  }

  const N = 1048576 // The CPU/Memory cost parameter
  const r = 8 // The block size parameter
  const p = 1 // The parallelization parameter
  const dkLen = 32 // The desired length of the derived key in bytes

  const stretchedKey = await deriveKey(seed, salt, N, r, p, dkLen) // Stretch the key using scrypt

  return stretchedKey
}

/**
 * Cleans up a Base32 encoded string by fixing common typos and removing hyphens.
 *
 * This function replaces all instances of the letters 'i' and 'l' (case-insensitive) with the digit '1',
 * and all instances of the letter 'o' (case-insensitive) with the digit '0'. It also removes any hyphens
 * in the input string. The resulting string is returned in uppercase.
 *
 * @param id - The Base32 encoded string to clean up.
 * @returns The cleaned-up Base32 encoded string.
 */
function cleanBase32(id: string): string {
  const cleanedId = id
    .replace(/i/gi, "1") // Replace 'i' (case-insensitive) with '1'
    .replace(/l/gi, "1") // Replace 'l' (case-insensitive) with '1'
    .replace(/o/gi, "0") // Replace 'o' (case-insensitive) with '0'
    .replace(/-/g, "") // Remove hyphens

  // Convert cleaned-up string to uppercase and return
  return cleanedId.toUpperCase()
}

await new Command()
  .name("sharkey")
  .version(VERSION)
  .description(
    "Generate, share, and recover an age encryption key using threshold secret sharing."
  )
  .action(function () {
    this.showHelp()
  })
  .command(
    "generate",
    "Generate an age keypair and the threshold secret sharing shares that can be used to re-create it."
  )
  .option(
    "-t, --threshold <threshold:integer>",
    "Number of shares required to re-create an age identity.",
    {
      required: true,
      value: (value) => {
        if (value < MIN_SHARES || value > MAX_SHARES) {
          throw new ValidationError(
            `Threshold must be at least ${MIN_SHARES}, but no more than ${MAX_SHARES}.`
          )
        }
        return value
      },
    }
  )
  .option("-s, --shares <shares:integer>", "Number of shares to generate.", {
    required: true,
    value: (value) => {
      if (value < MIN_SHARES || value > MAX_SHARES) {
        throw new ValidationError(
          `Shares must be at least ${MIN_SHARES}, but no more than ${MAX_SHARES}.`
        )
      }
      return value
    },
  })
  .env(
    "SEED=<seed:string>",
    "Base64 encoded 48 byte seed used to re-create an age identity. Default is a random value."
  )
  .option(
    "--seed <seed:string>",
    "Base64 encoded 48 byte seed used to re-create an age identity. Default is a random value. Note that when a seed is specified the age keypair will always be the same, but a new set of shares, incompatible with any others, will be generated."
  )
  .option(
    "--no-display-seed",
    "Hide the display of the secret seed value in the console output? This will prevent the seed from being accidentally copied and pasted. You will not be able to recreate the generated age keypair and a new set of shares without the seed."
  )
  .option(
    "--no-display-secret-key",
    "Hide the display of the age identity secret key value in the console output? This will prevent the secret key from being accidentally copied and pasted. You will not be able to decrypt any data encrypted to the public key unless you combine the threshold number of shares to re-create the keypair."
  )
  .action(async (options) => {
    let decodedSeed
    if (options.seed) {
      try {
        decodedSeed = base64.decode(options.seed)
      } catch (error) {
        throw new ValidationError(
          `Seed must be a Base64 encoded string. ${error.message}`
        )
      }
    }

    if (decodedSeed && decodedSeed.length !== SEED_LENGTH + SALT_LENGTH) {
      throw new ValidationError(
        `Seed must be ${
          SEED_LENGTH + SALT_LENGTH
        } bytes in length when decoded (got ${decodedSeed.length} bytes).`
      )
    }

    if (options.threshold > options.shares) {
      throw new ValidationError(
        `Threshold must be less than or equal to the total number of shares (got ${options.threshold} threshold and ${options.shares} shares)`
      )
    }

    // Generate a random 32 + 16 byte seed if one was not provided.
    // The first 32 bytes are the seed, the last 16 bytes are the salt.
    const seed =
      decodedSeed ??
      crypto.getRandomValues(new Uint8Array(SEED_LENGTH + SALT_LENGTH))
    const seedCreatedAt = new Date()
    const shareId = generateShareId(seedCreatedAt.getTime())

    const shares = await split(
      seed,
      options.threshold,
      options.shares,
      shareId
    )

    const stretchedSeed = await stretchSeed(
      seed.slice(0, SEED_LENGTH),
      seed.slice(SEED_LENGTH)
    )
    const identity = generateAgeIdentityFromSeed(stretchedSeed)
    wipe(stretchedSeed)

    const secretOutput = `
seed             ${options.displaySeed ? base64.encode(seed) : "********"}
age secretKey    ${options.displaySecretKey ? identity.secretKey : "********"}
`

    wipe(seed)

    const publicOutput = `
threshold        ${options.threshold}-of-${options.shares}
created at       ${seedCreatedAt.toISOString()}
age publicKey    ${identity.publicKey}
`

    console.log(``)
    console.log(colors.bold.red("SECRET"))
    console.log(colors.bold.red("-------------"))
    console.log(secretOutput)
    console.log(colors.bold.green("PUBLIC"))
    console.log(colors.bold.green("-------------"))
    console.log(publicOutput)
    console.log(colors.bold.yellow("SHARES"))
    console.log(colors.bold.yellow("-------------"))
    console.log(``)

    shares.map((share, index) => {
      console.log(colors.dim(`${'-' .repeat(40)} CUT HERE ${'-' .repeat(40)}`))
      console.log(``)
      console.log(colors.dim(`Share     : #${index + 1} of ${ readThreshold(share)}-of-${options.shares} scheme`))
      console.log(colors.dim(`Timestamp : ${shareIdToDate(readIdentifier(share)).toISOString()}`))
      console.log(colors.dim(`ID        : ${base32crockford.encode(readIdentifier(share).slice(8))}`))
      console.log(colors.dim(`URL       : https://github.com/grempe/sharkey`))
      console.log(colors.dim(`VERSION   : ${VERSION}`))

      console.log(colors.dim(`

INSTRUCTIONS:

This is a secret share. Keep it safe, and don't provide it to anyone unless they
can confirm knowledge of the timestamp and ID associated with this share. There are
${options.shares} shares in total, any ${options.threshold} of which are needed to re-create the secret.

You may have received additional instructions from the person who generated this
share. If so, please carefully follow them.

You should store this share in a safe place, and make sure it is backed up. You
may want to store it electronically, and also print it for safekeeping. Wherever
you store it, make sure unauthorized people cannot access it.

The share is encoded in two different formats for convenience. Either one
can be used to help re-create the secret.`))

      console.log(``)
      console.log(colors.dim(`Base32 Crockford Encoded Share`))
      console.log(colors.dim(`--`))
      console.log(colors.yellow(base32crockford.encode(share)))
      console.log(colors.dim(`--`))

      console.log(``)
      console.log(colors.dim(`Passphrase Encoded Share`))
      console.log(colors.dim(`--`))
      const sharePassphrase = bytesToPassphrase(share).join(" ")
      console.log(colors.yellow(sharePassphrase))
      console.log(colors.dim(`--`))
      console.log(``)
      console.log(``)
    })
  })
  .command(
    "combine",
    "Interactively combine secret shares to recover an age keypair. The keypair will be written to STDOUT unless an --output path is specified."
  )
  .option(
    "-o, --output=<output:string>",
    "Write the age keypair to the specified file path. The public key will be written to STDERR."
  )
  .option(
    "-f, --force",
    "Force overwrite of an existing age keypair at the path specified by --output.",
    { depends: ["output"] }
  )
  .action(async (options) => {
    const shares: Uint8Array[] = []

    console.log(colors.blue(`

    ███████ ██   ██  █████  ██████  ██   ██ ███████ ██    ██ 
    ██      ██   ██ ██   ██ ██   ██ ██  ██  ██       ██  ██  
    ███████ ███████ ███████ ██████  █████   █████     ████   
         ██ ██   ██ ██   ██ ██   ██ ██  ██  ██         ██    
    ███████ ██   ██ ██   ██ ██   ██ ██   ██ ███████    ██    
                                                             
    `))

    console.log(
      colors.dim(`
Welcome to SharKey, a tool for recovering age keypairs from
secret shares. To recover a secret keypair, enter your shares
at the prompt below. Once the expected number of shares are entered,
an attempt will be made to re-combine the shares and recover the
keypair.

If any shares are invalid, or unmatched with the others, an error
message will be shown.

Enter shares one at a time by typing or pasting them, pressing return after
each one.

To exit, press control-c.

`)
    )

    // prompt for shares, one at a time, until newline
    await prompt([
      {
        name: "share",
        message: "share",
        hint: `Enter a single share [return to continue]`,
        type: Input,
        validate: (share) => {
          let tempShare: Uint8Array = new Uint8Array()

          if (share.trim() === "") {
            return "Invalid share. Empty string."
          }

          try {
            tempShare = base32CrockfordRegex.test(cleanBase32(share)) ? base32crockford.decode(cleanBase32(share)) : passphraseToBytes(share)
          } catch (error) {
            return `Invalid share. ${error.message}`
          }

          try {
            readThreshold(tempShare)
          } catch (error) {
            return `Invalid share, unable to read threshold value. ${error.message}`
          }

          try {
            readIdentifier(tempShare)
          } catch (error) {
            return `Invalid share, unable to read identifier value. ${error.message}`
          }

          if (shares.length > 0) {
            const firstShare = shares[0]
            const firstShareIdentifier = readIdentifier(firstShare)
            const firstShareThreshold = readThreshold(firstShare)
            const tempShareIdentifier = readIdentifier(tempShare)
            const tempShareThreshold = readThreshold(tempShare)

            if (!equal(firstShareIdentifier, tempShareIdentifier)) {
              return `Invalid share, identifier mismatch. Expected ${firstShareIdentifier}, got ${tempShareIdentifier}.`
            }

            if (firstShareThreshold !== tempShareThreshold) {
              return `Invalid share, threshold mismatch. Expected ${firstShareThreshold}, got ${tempShareThreshold}.`
            }
          }

          // valid share format
          return true
        },
        after: async ({ share }, next) => {
          if (share) {
            const trimmedShare = share.trim()
            const decodedShare = base32CrockfordRegex.test(cleanBase32(trimmedShare)) ? base32crockford.decode(cleanBase32(trimmedShare)) : passphraseToBytes(trimmedShare)
            shares.push(decodedShare)

            if (
              (shares.length > 0 &&
                shares.length >= readThreshold(shares[0])) ||
              shares.length >= MAX_SHARES
            ) {
              await next() // end prompt loop, try to combine
            } else {
              await next("share") // loop back, prompt for another share
            }
          }
        },
      },
    ])

    console.log(colors.dim(`\nProcessing ${shares.length} shares...\n`))

    const seedCreatedAtBytes = readIdentifier(shares[0])
    const seedCreatedAt = shareIdToDate(seedCreatedAtBytes)

    let seed
    try {
      seed = combine(shares)
    } catch (error) {
      throw new Error(`Error, failed to combine shares. ${error.message}`)
    }

    if (seed.length !== SEED_LENGTH + SALT_LENGTH) {
      throw new Error(
        `Error, invalid seed length. Expected ${
          SEED_LENGTH + SALT_LENGTH
        } bytes (got ${seed.length} bytes).`
      )
    }

    const stretchedSeed = await stretchSeed(
      seed.slice(0, SEED_LENGTH),
      seed.slice(SEED_LENGTH)
    )
    wipe(seed)

    let identity
    try {
      identity = generateAgeIdentityFromSeed(stretchedSeed)
    } catch (error) {
      throw new Error(
        `Error, unable to generate age identity. ${error.message}`
      )
    }
    wipe(stretchedSeed)

    console.log(colors.green(`Success! The age keypair has been recovered.`))

    const output = `# created: ${seedCreatedAt.toISOString()}\n# public key: ${
      identity.publicKey
    }\n${identity.secretKey}\n`

    if (options.output) {
      // write age keypair to file, and public key to stderr
      try {
        await Deno.writeTextFile(options.output, output, {
          createNew: options.force ? false : true,
        })
        console.error(`Public key: ${identity.publicKey}`)
      } catch (error) {
        throw new Error(
          `Error, unable to write output to file. ${error.message}`
        )
      }
    } else {
      // write age keypair to STDOUT
      console.log("")
      console.log(output)
    }
  })
  .parse(Deno.args)
