# Sharkey

Sharkey is a [TypeScript](https://www.typescriptlang.org/)-based CLI utility that uses [Deno](https://deno.com/runtime) to generate a random [age](https://age-encryption.org/) encryption identity keypair. The [age](https://age-encryption.org/) secret key is split into shares, which can only be recovered when a minimum number of shareholders collaborate. This tool is ideal for secure data encryption to a public key, only decryptable by a minimum number of shareholders.

## The problem

Let's assume, for example, that you want to make your password manager's passphrase available to the person(s) you have designated as your "digital executor" in your last will and testament.

Your password manager likely contains every sensitive credential needed to steal not only your identity, but many of the assets you own. You must be sure that your plan protects against ever revealing its contents, until you want it revealed.

The easiest way to do this would be to write down the passphrase and store it with your important papers. Sounds simple right? However, this method is not only insecure, it is unlikely to even work when it is needed most.

Over a timescale of years can you be certain that:

* You won't change the passphrase, locking the intended recipient out?
* You trust the people you shared the passphrase with forever?
* The people you shared the passphrase with will survive you?
* The paper record won't be destroyed in a fire or flood?
* The paper record won't be stolen (and used by the thief)?

Since this method is fragile and we don't want to give `superuser` access over our lives to others, clearly this method won't work without taking on a great deal of risk.

## A better way

Thankfully, this can be done more safely. Here's an example scenario:

1. Use `sharkey` to generate an [age](https://age-encryption.org/) encryption identity keypair deterministically from a random secret seed value.
1. Instruct `sharkey` to split the seed into ten shares, where any six of the ten shares together can recover the encryption identity. Any fewer get nothing.
1. Provide one share to each of the ten closest members of your immediate family, your closest friends, and your lawyer. Trust some more than others? Give them more of the shares, thus requiring fewer collaborators.
1. Instruct each recipient to only provide their share to your spouse or lawyer (in that order) when they are satisfied that you are actually no longer with us.
1. Using the public key, create an [age](https://age-encryption.org/) encrypted file that contains your passphrase.

This way, you know that at least six of these trusted people would need to collude with each other in order to improperly gain access to your secrets.

Now, you can go about your life. periodically updating an encrypted file that contains your passphrase. You can print or publish this file in a place where your spouse or lawyer knows to find it. Include with it the list of shareholders and how to contact them. You don't have to protect it or worry about it being stolen or destroyed since it is fully encrypted and can be easily recreated.

When you pass, your spouse or lawyer collects the shares and recreates the identity privateKey that allows them to decrypt your secrets at the appropriate time.

This technique allows you to remain in control at all times. If at any moment you no longer trust anyone in the group, simply change the passphrase of your password manager. At that moment, the shares and the encrypted file become useless. Now, you can start over and generate a new age identity, a new set of shares, and a new encrypted file to be distributed to a new, more trusted group.

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

### Generating a new identity and shares

A new keypair with shares that allow any 3 of 5 shares to re-create.

#### Security Tip

For additional security when generating a new keypair, you can hide the `seed` and/or the `secretKey` values from the output with the `--no-display-seed` and `--no-display-secret-key` flags. This means that even you won't know the `seed` value used to re-create the keypair without combining `shares`, and you won't know the `privateKey` needed to decrypt data encrypted to the `publicKey` of that keypair.

If you don't know the `seed` and the `privateKey`, and you give away all physical copies of the `shares`, the only way to recover the keys is to convince enough of the shareholders to give them back to you.

```sh
sharkey generate -t 3 -s 5

SECRET
-------------

seed             aoU9iw/JH+nz2+JEGBrqBo0go5Kq08UCF+0Zq/jkDW38uuX3+S8QHTVAEETdOU3i
age secretKey    AGE-SECRET-KEY-1XES6VVUYXQP6U30X2PRRUKXCXHZ0UJ086DZUJ6M3ULJJVTQQMAYQULN3VZ

PUBLIC
-------------

threshold        3-of-5
created at       2023-05-06T19:45:54.972Z
age publicKey    age1qpr733mdcngf8ek8fn860uzwlgguude4n3eln8nttg3ssy95cuwq40phvd

SHARES
-------------

Share 1 of 5:
--
000031ZJK5RHR000000000000010602H040YWNQ0CJH790MRP24JYWVHG5PYCJY8Z70VHBK9FJ375G4KHXK0D5YHHTE94H3VESF2PYSFPS92D28C6FN2FANWDA5KCQFGSVPHDYV0GKHZ9KCCETVSPJP2A1EX977QNG

Share 2 of 5:
--
000031ZJK5RHR000000000000010602H0B6J56HCN1QBGKJMFH2Y7FXX9PGJN1R46M6Q8RN5P15BW32Z8ENCMPRX8985X25QQA9EFDZ3FAFEMHE0ZWKEPSKGMS3ZN49W08GXMDXC90QKG0A0Q9XNF1GEKJ8HGM1VC0

Share 3 of 5:
--
000031ZJK5RHR000000000000010602H0EK4KWA7RC2X699Z2WQ8HN6P4V543V3FBSK1Y2EEVCGXASSM530T2C3P54XKBRYWT7WRSQ4827TR2BNBJH6R038VSMP93YJQD55B2Q674D256THBT483SVB5YZX76ETG1C

Share 4 of 5:
--
000031ZJK5RHR000000000000010602H0KG0ZDR1GN1SARVSA5MCX4MGC260FAH930G5JKW8KNKS68BJDT3YEXHGDXYQ79CTJYZWN6PEAYSWET7DT85WCJTXHDNDFF0H5W6FE6M1CM11AB3DJXB7NAS3P6Y3AZ8P9M

Share 5 of 5:
--
000031ZJK5RHR000000000000010602H0P5P9Q3AXRMFW20J781TBYFV1FKPSGA2ED5K4973YR6FGJGS0QP8R7AV0GB1HKQHZKAA3WD57KCAR0W6Q5GAT81PW00VSNVT8HKSRWFA1SMQWHR6ZGYH3G28VBBNW5KX4R
```

#### Optional

If you know the `seed` value you can re-create the same keypair with. In this example we do that while changing the configuration to allow any `2-of-3` shares to re-create instead of any `3-of-5`.

Note that the `age` keypair is the same, but the shares are completely different. The creation of the shares is never deterministic, the output is always different even though they can re-combine to the same `seed` value. Mixing shares from different runs will always result in an error.

```sh
sharkey generate -t 2 -s 3 --seed aoU9iw/JH+nz2+JEGBrqBo0go5Kq08UCF+0Zq/jkDW38uuX3+S8QHTVAEETdOU3i

SECRET
-------------

seed             aoU9iw/JH+nz2+JEGBrqBo0go5Kq08UCF+0Zq/jkDW38uuX3+S8QHTVAEETdOU3i
age secretKey    AGE-SECRET-KEY-1XES6VVUYXQP6U30X2PRRUKXCXHZ0UJ086DZUJ6M3ULJJVTQQMAYQULN3VZ

PUBLIC
-------------

threshold        2-of-3
created at       2023-05-06T19:50:57.556Z
age publicKey    age1qpr733mdcngf8ek8fn860uzwlgguude4n3eln8nttg3ssy95cuwq40phvd

SHARES
-------------

Share 1 of 3:
--
000031ZJKR7H8000000000000010402H07XH9B0TKSC8WY3299SXB2CBFEBHSC9J0CXM4N4KGSY8GEK9EPEFRV9BEHK6HFM1HJJD30EN9JMDRWZPS48DTM26J1RWS9RA6GBYR0CTFRCGWDVPHH6P3C1RNAKJWSGDAR

Share 2 of 3:
--
000031ZJKR7H8000000000000010402H099VR15J6VR2DM6AWBDQT893TCZV86CTNE9YNZ1V5VA214P1VMT59HC3VK7C05H94G67JABXWG079PTYC6W7BY7E73CP83X2KJZM9A9JTTRTD7YY4KJWJ64G087RDKN5ZR

Share 3 of 3:
--
000031ZJKR7H8000000000000010402H0F12V593MXGVEGAVED5ESC5J8AQ2B20B7817PVDAQX2V20TG9JJWAN0J9NFN31XRPPEYHE7CEP8YAJPFY0MY8TBZN54FB7HK1MQDAE538WG3E3JFPNT5H281JEF1EQSMDW
```

### Recovering an identity from shares

Run `sharkey combine`. This is an interactive process and you'll be prompted to enter shares, one at a time.

When you've either entered enough shares to meet the threshold (embedded in each share), or if you press `ENTER` on an empty prompt, the program will try to combine your shares and recover the `age` keypair.

This process will either succeed, and output the keypair, or it will fail with an error. It should NEVER return an incorrect keypair, even if some shares are corrupted or tampered with. The shares contain an embedded hash that is used to confirm that the value returned from the `combine` operation is the one that was originally intended.

You can also use the `--output` option to save the keypair to a file path.

Entering 2-of-3 shares from the `generate` examples above result in the same keys being output.

```sh
sharkey combine
Welcome to SharKey!

To generate an age keypair, enter your shares at the prompts below.
Once the required number of shares is entered or an empty line is
submitted, the shares will be re-combined. If any shares are invalid
or the threshold is not met, an error will occur and you'll need to
try again.

 ? share › ******************************************************************************************************************************************************************
 ? share › ******************************************************************************************************************************************************************

# created: 2023-05-06T19:50:57.556Z
# public key: age1qpr733mdcngf8ek8fn860uzwlgguude4n3eln8nttg3ssy95cuwq40phvd
AGE-SECRET-KEY-1XES6VVUYXQP6U30X2PRRUKXCXHZ0UJ086DZUJ6M3ULJJVTQQMAYQULN3VZ
```

## Testing & Verification

If you run the `sharkey generate` command with a known good seed, you should see the same `age secretKey` and `age publicKey` values. The shares will never be the same between runs and this is to be expected (but they will recreate the same keypair with `sharkey combine`).

### Test Case

The `seed` value `aoU9iw/JH+nz2+JEGBrqBo0go5Kq08UCF+0Zq/jkDW38uuX3+S8QHTVAEETdOU3i` should create an `age` identity with the following keys:

```sh
sharkey generate -t 2 -s 3 --seed aoU9iw/JH+nz2+JEGBrqBo0go5Kq08UCF+0Zq/jkDW38uuX3+S8QHTVAEETdOU3i
```

| KEY   |  |
| ------------|----------------------------------------------------------------|
| `publicKey`   | `age1qpr733mdcngf8ek8fn860uzwlgguude4n3eln8nttg3ssy95cuwq40phvd` |
| `secretKey`   | `AGE-SECRET-KEY-1XES6VVUYXQP6U30X2PRRUKXCXHZ0UJ086DZUJ6M3ULJJVTQQMAYQULN3VZ` |

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
