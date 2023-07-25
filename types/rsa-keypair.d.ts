declare module 'rsa-keypair' {
  function generate(
    modulusBits?: number,
    exponent?: number,
    passPhrase?: string,
  ): {
    privateKey: Buffer;
    publicKey: Buffer;
  };
}