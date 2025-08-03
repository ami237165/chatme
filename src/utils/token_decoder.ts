export const  decodeJWT = (token:string) => {
  console.log("TTTTTTTTTT , ",typeof(token));
  
  if (typeof token !== 'string') {
    throw new Error("Invalid token: must be a string");
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error("Invalid token: must have 3 parts separated by dots");
  }

  const [headerEncoded, payloadEncoded, signature] = parts;

  function base64UrlDecode(str:string) {
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' if needed
    while (str.length % 4 !== 0) {
      str += '=';
    }
    // Decode
    return Buffer.from(str, 'base64').toString('utf8');
  }

  let header, payload;

  try {
    header = JSON.parse(base64UrlDecode(headerEncoded));
  } catch (err:any) {
    throw new Error("Invalid JWT header: " + err.message);
  }

  try {
    payload = JSON.parse(base64UrlDecode(payloadEncoded));
  } catch (err:any) {
    throw new Error("Invalid JWT payload: " + err.message);
  }

  return {
    header,
    payload,
    signature
  };
}
