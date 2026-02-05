import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', 
        '/admin-panel/', 
        '/registration', // I-block ang registration page
        '/api/', 
        '/login'
      ],
    },
    sitemap: 'https://disruptive-solutions-inc.vercel.app/sitemap.xml',
  }
}