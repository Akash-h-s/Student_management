// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    // Your components stories - matches your path structure
    '../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/pages/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/context/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    
    // Also include any MDX documentation
    '../src/**/*.mdx',
    
    // Keep the default stories folder if you want
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.mdx'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-a11y', // Accessibility testing
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'], // If you have public assets
};

export default config;