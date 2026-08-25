// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { visit } from 'unist-util-visit';

function rehypeFigureCaption() {
  // El árbol que recibe un plugin de rehype es un árbol hast. Se anota porque
  // este fichero lleva `// @ts-check` y el tsconfig extiende
  // `astro/tsconfigs/strict`: sin tipo, `astro check` falla con ts(7006) y el
  // `verify` que lo encadena nacería en rojo.
  //
  // Va como `any` y no como `import('hast').Root` a propósito: `@types/hast` es
  // dependencia transitiva de `unist-util-visit` y con el `node_modules`
  // aislado de pnpm no se puede importar desde aquí — da ts(2307), comprobado.
  // El tipo exacto exigiría declarar `@types/hast` como dependencia propia.
  /** @param {any} tree */
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
