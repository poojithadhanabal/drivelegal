import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  plugins: [

    react(),

    VitePWA({

      registerType: 'autoUpdate',

      manifest: {

        name: 'DriveLegal',

        short_name: 'DriveLegal',

        description:
          'AI Traffic Law Assistant',

        theme_color: '#ec4899',

        background_color: '#0f1220',

        display: 'standalone',

        start_url: '/',

        icons: [

          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/png'
          },

          {
            src: '/vite.svg',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }

    })

  ]

})