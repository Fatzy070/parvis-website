export function SEO({
  title,
  description,
  canonical,
  noindex = false,
  ogType = "website",
  ogImage,
  structuredData,
}) {
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://www.parvis.com.ng";
  const url = canonical ? `${siteUrl}${canonical}` : `${siteUrl}${window.location.pathname}`;

  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      
      <link rel="canonical" href={url} />
      
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </>
  );
} 

