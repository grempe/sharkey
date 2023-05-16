# Sharkey

Sharkey is a [TypeScript](https://www.typescriptlang.org/)-based CLI utility that uses [Deno](https://deno.com/runtime) to generate a random [age](https://age-encryption.org/) public key encryption identity keypair. The [age](https://age-encryption.org/) secret key is split into shares, which can only be recovered when a minimum number of shareholders collaborate. This tool is ideal for secure data encryption to a public key, only decryptable by a threshold number of shareholders.

## The problem

Let's assume, for example, that you want to make your password manager's passphrase available to the person(s) you have designated as your "digital executor" in your last will and testament.

Your password manager likely contains every sensitive credential needed to steal not only your identity, but many of the assets you own. You must be sure that your plan protects against ever revealing its contents, until they should be to the right person.

The easiest way to do this would be to write down the passphrase and store it with your important papers. Sounds simple right? However, this method is not only insecure, it risks not working when it is needed most.

Over a timescale of years can you be certain that:

* You won't change the passphrase, locking the intended recipient out?
* You trust the people you shared the passphrase with forever?
* The people you shared the passphrase with will survive you?
* The paper record won't be destroyed in a fire or flood?
* The paper record won't be stolen (and used by the thief)?

Since this method is fragile and we don't want to give god level access over our lives to others, clearly this method isn't safe or reliable.

## A better way

Thankfully, there's a better way. Here's an example scenario:

1. Use `sharkey` to generate an [age](https://age-encryption.org/) encryption identity keypair deterministically from a random secret seed value that no one knows (maybe not even you).
1. Instruct `sharkey` to split the seed into ten shares, where any six of the ten shares combined together can recover the encryption identity. Any fewer get nothing.
1. Provide one share to each of the ten closest members of your immediate family, your closest friends, and your lawyer. Trust some more than others? Give them more of the shares, thus requiring fewer collaborators.
1. Instruct each recipient to only provide their share to your spouse or lawyer (in that order) when they are satisfied that you are actually no longer with us.
1. Using the public key, create an [age](https://age-encryption.org/) encrypted file that contains your passphrase. You can continue to add information to this file without a secret key.

Using this technique you can rest assured that at least six of these trusted people would need to collude with each other in order to improperly gain access to your secrets.

Now, you can go about your life. periodically updating an encrypted file that contains your passphrase. You can print or publish this file in a place where your spouse or lawyer knows to find it. Include with it the list of shareholders and how to contact them. You don't have to protect it or worry about it being stolen or destroyed since it is fully encrypted and can be easily recreated.

When you pass, your spouse or lawyer collects the shares and recreates the identity `privateKey` that allows them to decrypt your secrets.

This way you to remain in control at all times. If at any moment you no longer trust anyone in the group, simply change the passphrase of your password manager. At that moment, the shares and the encrypted file become useless even if decrypted. Now, you can start over and generate a new age identity, a new set of shares, and a new encrypted file to be distributed to a new, more trusted group.

## Installation

### Homebrew

If you are using `macOS` or `Linux` you can install `sharkey` via Homebrew. This is the preferred way to install.

First, install Homebrew as needed:

<https://docs.brew.sh/Installation>

Then install `sharkey`:

```sh
brew tap grempe/tap
brew install sharkey
```

To upgrade:

```sh
brew upgrade sharkey
```

### Manually

Install Deno following the [Deno installation instructions](https://deno.com/manual/getting_started/installation).

Testing your installation

```sh
deno --version
```

Clone the `sharkey` repository locally:

```sh
# clone the repository
git clone https://github.com/grempe/sharkey.git

# change to the sharkey directory
cd sharkey

# build a local copy
deno task build-local

# verify you can run it
./sharkey -h

```

NOTE : You'll need to replace the references to run the program from `sharkey` to the locally scoped `./sharkey` in this README if you install manually.

## Usage

### Security Tip

For maximum security when generating a new keypair, you can hide the `seed` and/or the `secretKey` values from the output with the `--no-display-seed` and `--no-display-secret-key` flags. This means that even you won't know the `seed` value used to re-create the keypair without combining the generated `shares`, and you won't know the `privateKey` needed to decrypt data encrypted to the `publicKey` of that keypair.

If you don't know the `seed` and the `privateKey`, and you give away all physical copies of the `shares`, the only way to recover the keys is to convince enough of the shareholders to give shares back to you and `combine` them. This is like a lockbox that you can put items into, but it can only be opened by the trusted group.

### Generating a new identity and shares

A new keypair with shares that allow any 2 of 3 shares to re-create.

```txt
% sharkey generate -t 2 -s 3

SECRET
-------------

seed             jO5MXtZs+b0ax9EwVZgE1m44cPS6TN8/wNiv798Bt/lj3igbpUh90SwlQ/0Xu6Fu
age secretKey    AGE-SECRET-KEY-1TU75FFFFWLK2ZZFLFHCLJL0RGKD4Z7733CH3NJ92FN9SP4EXU7HQQZS3PD

PUBLIC
-------------

threshold        2-of-3
created at       2023-05-16T18:54:40.500Z
age publicKey    age1eml9qdxzpw27dgd8z83wl98r68gz430fmp387gr48guycen53ejqw2qvd8

SHARES
-------------

---------------------------------------- CUT HERE ----------------------------------------

Share     : #1 of 2-of-3 scheme
Timestamp : 2023-05-16T18:54:40.000Z
ID        : FBE9NCE5TEW9C
URL       : https://github.com/grempe/sharkey
VERSION   : 0.0.3


INSTRUCTIONS:

This is a secret share. Keep it safe, and don't provide it to anyone unless they
can confirm knowledge of the timestamp and ID associated with this share. There are
3 shares in total, any 2 of which are needed to re-create the secret.

You may have received additional instructions from the person who generated this
share. If so, please carefully follow them.

You should store this share in a safe place, and make sure it is backed up. You
may want to store it electronically, and also print it for safekeeping. Wherever
you store it, make sure unauthorized people cannot access it.

The share is encoded in two different formats for convenience. Either one
can be used to help re-create the secret.

Base32 Crockford Encoded Share
--
E38P6S0000000YPWKARWBMXRJR10402H04QMVVZXEQ7NM7NSCHS97XHVMXTWV6YKAWCYYZ4WCDXGRK3WM8A5NG3XHEW0DTYYEA7RDR2YPGC05K93MBCKA68VVTX652201WQ6HTWJT32BS6A3FA752YMBY172VNWGQR
--

Passphrase Encoded Share
--
interpreted hereditary a a lentando pal semantical reobtaining affluently achromatism admonisher feral wordperfect sociologist catling hirsutism occur dishonorably karate paraplegic galahad unmannerly partake letterer fancy pimplier gloomful lockout remigrate uncivilized irreproachably mimeoing gull broadaxe slipup pivot deifier campaigned respectably mislabelled bedizen idly numbing seaquake overprotection legging flowchart muling festering stripiest roentgenoscopic pad safely
--


---------------------------------------- CUT HERE ----------------------------------------

Share     : #2 of 2-of-3 scheme
Timestamp : 2023-05-16T18:54:40.000Z
ID        : FBE9NCE5TEW9C
URL       : https://github.com/grempe/sharkey
VERSION   : 0.0.3


INSTRUCTIONS:

This is a secret share. Keep it safe, and don't provide it to anyone unless they
can confirm knowledge of the timestamp and ID associated with this share. There are
3 shares in total, any 2 of which are needed to re-create the secret.

You may have received additional instructions from the person who generated this
share. If so, please carefully follow them.

You should store this share in a safe place, and make sure it is backed up. You
may want to store it electronically, and also print it for safekeeping. Wherever
you store it, make sure unauthorized people cannot access it.

The share is encoded in two different formats for convenience. Either one
can be used to help re-create the secret.

Base32 Crockford Encoded Share
--
E38P6S0000000YPWKARWBMXRJR10402H0B8V6483HCRT9R27KA66T265B65K6S9DN7KH30K2KP2Z5CM2BKNA8FM3EN3FG590HHRQG7N09BKFRCYXBGKWQSZ54129RXNYY789C5BC5RX44SXXGHRAZ13N1TRD6ABE80
--

Passphrase Encoded Share
--
interpreted hereditary a a lentando pal semantical reobtaining affluently achromatism alcalde recharting allotropic dabbing tenderly paginal indulgence seedpod motley holographic privater bide height microhm reavow gravidly plunker mealier enzyme bongoist murkiest lactose pewterer treachery decolonizing grabbed skillfully touchily empowerment kinesiologic untangled organized incrusted dirgeful hydric menarche quizzer judgmatic rant conjunction drought pad safely
--


---------------------------------------- CUT HERE ----------------------------------------

Share     : #3 of 2-of-3 scheme
Timestamp : 2023-05-16T18:54:40.000Z
ID        : FBE9NCE5TEW9C
URL       : https://github.com/grempe/sharkey
VERSION   : 0.0.3


INSTRUCTIONS:

This is a secret share. Keep it safe, and don't provide it to anyone unless they
can confirm knowledge of the timestamp and ID associated with this share. There are
3 shares in total, any 2 of which are needed to re-create the secret.

You may have received additional instructions from the person who generated this
share. If so, please carefully follow them.

You should store this share in a safe place, and make sure it is backed up. You
may want to store it electronically, and also print it for safekeeping. Wherever
you store it, make sure unauthorized people cannot access it.

The share is encoded in two different formats for convenience. Either one
can be used to help re-create the secret.

Base32 Crockford Encoded Share
--
E38P6S0000000YPWKARWBMXRJR10402H0DS11CN05290EGZ474QWXAV6Z8M91HME192B48E17RK52491ZX4GF790TVJNQDM35Z9DQF83X52NZ43YZY26GH26GFKKZN8XA9SKBDPFHPCY3H0Y4Z9GR9YPNM9Q12PDWC
--

Passphrase Encoded Share
--
interpreted hereditary a a lentando pal semantical reobtaining affluently achromatism alleviative beseeching petrographic northeast embarrassment dictaphone snobbier hulloed condemned sentinel attractant reaping sandaled colonelship beveled youthen archeology chez towery regularizer cruse suspensive alternately endothermal noncontradictory zealously hypnotist entertainer trendily steadying foolhardier demerited soggily overwhelm scrimpiest composition backspacing storeroom blimpish morn timework pad safely
--
```

#### Optional

If you know the `seed` value you can re-create the same `age` keypair with it.

Note that the `age` keypair is the same, but the shares are completely different and incompatible with any others. The re-creation of the `age` identity is deterministic, but the shares are different every time. Attempting to `combine` shares from different sets will always result in an error as they don't share the same `ID`.

```sh
sharkey generate -t 2 -s 3 --seed jO5MXtZs+b0ax9EwVZgE1m44cPS6TN8/wNiv798Bt/lj3igbpUh90SwlQ/0Xu6Fu
...
```

### Recovering an identity from shares

Run `sharkey combine`. This is an interactive process and you'll be prompted to enter shares, one at a time.

When you've either entered enough shares to meet the threshold (embedded in each share), or if you press `ENTER` on an empty prompt, the program will try to combine your shares and recover the `age` keypair.

This process will either succeed, and output the keypair, or it will fail with an error. It should NEVER return an incorrect keypair, even if some shares are corrupted or tampered with. The shares contain an embedded hash that is used to confirm that the value returned from the `combine` operation is the one that was originally intended.

You can also use the `--output` option to save the keypair to a file path.

Entering 2-of-3 shares from the `generate` examples above result in the same keys being output.

```txt
% sharkey combine


    ███████ ██   ██  █████  ██████  ██   ██ ███████ ██    ██ 
    ██      ██   ██ ██   ██ ██   ██ ██  ██  ██       ██  ██  
    ███████ ███████ ███████ ██████  █████   █████     ████   
         ██ ██   ██ ██   ██ ██   ██ ██  ██  ██         ██    
    ███████ ██   ██ ██   ██ ██   ██ ██   ██ ███████    ██    
                                                             
    

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


 ? share › E38P6S0000000YPWKARWBMXRJR10402H04QMVVZXEQ7NM7NSCHS97XHVMXTWV6YKAWCYYZ4WCDXGRK3WM8A5NG3XHEW0DTYYEA7RDR2YPGC05K93MBCKA68VVTX652201WQ6HTWJT32BS6A3FA752YMBY172VNWGQR
 ? share › E38P6S0000000YPWKARWBMXRJR10402H0B8V6483HCRT9R27KA66T265B65K6S9DN7KH30K2KP2Z5CM2BKNA8FM3EN3FG590HHRQG7N09BKFRCYXBGKWQSZ54129RXNYY789C5BC5RX44SXXGHRAZ13N1TRD6ABE80

Processing 2 shares...

Success! The age keypair has been recovered.

# created: 2023-05-16T18:54:40.000Z
# public key: age1eml9qdxzpw27dgd8z83wl98r68gz430fmp387gr48guycen53ejqw2qvd8
AGE-SECRET-KEY-1TU75FFFFWLK2ZZFLFHCLJL0RGKD4Z7733CH3NJ92FN9SP4EXU7HQQZS3PD
```

## Testing & Verification

If you run the `sharkey generate` command with a known good seed, you should see the same `age secretKey` and `age publicKey` values. The shares will never be the same between runs and this is to be expected (but they will recreate the same keypair with `sharkey combine`).

### Test Case

The `seed` value `jO5MXtZs+b0ax9EwVZgE1m44cPS6TN8/wNiv798Bt/lj3igbpUh90SwlQ/0Xu6Fu` should create an `age` identity with the following keys:

```sh
sharkey generate -t 2 -s 3 --seed jO5MXtZs+b0ax9EwVZgE1m44cPS6TN8/wNiv798Bt/lj3igbpUh90SwlQ/0Xu6Fu
```

| KEY   |  |
| ------------|----------------------------------------------------------------|
| `publicKey`   | `age1eml9qdxzpw27dgd8z83wl98r68gz430fmp387gr48guycen53ejqw2qvd8` |
| `secretKey`   | `AGE-SECRET-KEY-1TU75FFFFWLK2ZZFLFHCLJL0RGKD4Z7733CH3NJ92FN9SP4EXU7HQQZS3PD` |

Following this command with an execution of `sharkey combine` and entering `2` shares from the output of `sharkey generate` with that known seed should also display the same `publicKey` and `secretKey` values.

## FAQ

### Where did the name `Sharkey` come from?

Its a [portmanteau](https://www.merriam-webster.com/dictionary/portmanteau) of the words `Share` and `Key`. It makes me think of sharks circling your secrets.

### What is Threshold Secret Sharing?

Threshold secret sharing (aka Shamir's Secret Sharing) is like having a secret treasure map that only a few people can read. Imagine you have a big treasure chest, and you want to keep it safe. But you're worried that if you keep the key to the treasure chest in one place, someone might find it and steal everything inside.

So, you decide to create a treasure map and split it into multiple pieces. You give one piece to your mom, one to your dad, one to your best friend, and one to your teacher. You tell them that they need to put their pieces together to see the full map.

But here's the twist: you tell them that they need at least three pieces to read the full map. So, if one of them loses their piece or it gets stolen, the thief won't be able to find the treasure because they don't have enough pieces.

That's what threshold secret sharing is. It's a way to keep something secret by splitting it into multiple pieces and making sure that only a certain number of pieces are needed to read the full secret. It's like having a secret code that only a group of people can decode together.

What's even better is that if you have a cryptographic share of something, instead of fragments of a map, you can't learn **anything** about the map until you've provided enough shares to meet the threshold. Its all, or nothing.

### How can you unevenly distribute trust using this scheme?

There are different techniques to distribute trust when using threshold secret sharing, depending on the specific needs and requirements of the situation. Here are a few examples:

1. Equal Shares: The simplest approach is to divide the secret into equal shares and distribute them equally among the participants. This ensures that everyone has an equal stake in protecting the secret.

2. Weighted Shares: In some situations, not all participants may be equally trustworthy or reliable. In such cases, the shares can be weighted to give more weight to more trustworthy participants. For example, if there are three participants, two of whom are highly trusted and one who is less so, the two trusted participants can each receive two shares, while the less trusted participant gets only one.

3. Hidden Shares: Sometimes, it may be desirable to keep some participants' shares hidden from others, to avoid collusion or information leaks. In this case, the shares can be distributed in such a way that each participant only knows their own share, and not the shares of the other participants.

4. Threshold Shares: In some situations, it may be desirable to require a certain threshold of participants to come together to reconstruct the secret. For example, if there are ten participants and a threshold of six is required, the shares can be distributed in such a way that any six participants can come together to reconstruct the secret, but no group of five or fewer can do so.

These are just a few examples of the different techniques that can be used to distribute trust when using threshold secret sharing. The approach used will depend on the specific needs and requirements of the situation, and may involve a combination of different techniques.

### Is it safe?

This code has not been audited for security issues and is used at your own risk.

That being said, it uses encryption libraries from developers that I trust and I have not invented any new cryptography in the creation of this tool.  `Sharkey` is simply a CLI wrapper around those existing libraries that makes the process of using them more convenient.

<https://www.stablelib.com/modules/_stablelib_tss.html>

<https://www.stablelib.com/modules/_stablelib_x25519.html>

<https://www.stablelib.com/modules/_stablelib_scrypt.html>

### Why is the seed value `48` bytes, and not `32`?

The seed is internally a `Uint8Array` where the first `32` bytes are stretched using `scrypt` to create the `X25519` keypair. The remaining `16` bytes of the `seed` is provided to `scrypt` as a unique salt.

### Does it send any data online?

No. No internet connections are made in the use of this software. It can be used offline on air-gapped computers. `Deno` enforces this and the CLI only requires the following permissions from `Deno`:

```txt
--allow-env=SEED --allow-write --allow-read
```

### Does it store any information?

No. By default, no data is written to disk unless you explicitly ask it to. This would only typically be by passing the `--output` flag to `combine` used to store the `age` identity to a file.

## Build and Release

For developers who want to build their own copy of the CLI.

Additional task are available in the `deno.json`.

### Local

`deno task build-local`

### Shared

All new commits to `main` will trigger a pre-release build of all binary assets and store them in a new Github [release](https://github.com/truestamp/truestamp-cli/releases) tagged with `latest`.

Steps for a public release:

* Ensure the `version` in [sharkey.ts](sharkey.ts) is updated to the desired version.
* Create a new `tag` (not a new Release!) where the tag name follows the form `vx.x.x` where the `x` represents a semantic version number. Example: `git tag -a v0.0.1 -m "v0.0.1"` followed by `git push origin v0.0.1`
* Once the `tagged-release.yml` workflow succeeds, a new release, with an automatic changelog will have been created.
* One of the build artifacts is the `CHECKSUMS-SHA2-256.txt` file, which contains the `SHA2-256` checksum of each of the build files. These checksum values should be transferred to the [homebrew-tap](https://github.com/grempe/homebrew-tap/blob/main/Formula/sharkey.rb) Homebrew Formula and pushed and tested.

## License

```txt
MIT License
Copyright (c) 2023 Glenn Rempe
```
