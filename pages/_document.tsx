import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    const title = "Lou Gehrig Fan Club";
    const desc  = "Official fan community — weekly features, milestones, and charitable initiatives.";
    const ogImg = "/lgfc-logo.png"; // replace with a wide OG image later
    const url   = "https://www.lougehrigfanclub.com";

    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="/favicon.png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="theme-color" content="#0a2a66" />
          <meta name="description" content={desc} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={desc} />
          <meta property="og:image" content={ogImg} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content={url} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={desc} />
          <meta name="twitter:image" content={ogImg} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
