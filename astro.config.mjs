// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { visit } from 'unist-util-visit';

function rehypeFigureCaption() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (
        node.tagName === 'p' &&
        node.children?.length === 1 &&
        node.children[0].tagName === 'img'
      ) {
        const img = node.children[0];
        const alt = img.properties?.alt || '';
        if (!alt) return;

        node.tagName = 'figure';
        node.properties = { class: 'img-figure' };
        node.children.push({
          type: 'element',
          tagName: 'figcaption',
          properties: {},
          children: [{ type: 'text', value: alt }],
        });
      }
    });
  };
}

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
    rehypePlugins: [rehypeFigureCaption],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
