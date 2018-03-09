import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';
import serve from 'rollup-plugin-serve';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    file: 'public/app.js',
    format: 'iife',
    globals: {
      // accounting: 'accounting',
      // '@cityofphiladelphia/mapboard': 'mapboard',
      // leaflet: 'L',
      jquery: '$',
    },
  },
  plugins: [
    // handle commonjs libs (e.g. accounting)
    commonjs({
      namedExports: {
        '../mapboard/node_modules/leaflet-virtual-grid/node_modules/leaflet/dist/leaflet-src.js': [
          'Layer',
          'setOptions',
          'Util',
          'bounds',
          'point',
          'latLngBounds',
        ],
      },
    }),
    // tell rollup how to resolve node modules
    resolve({
      jsnext: true,
    }),
    // include some node globals (e.g. process)
    globals(),
    // include some node builtins (e.g. url, http)
    builtins(),
    // transform json (for some reason axios throws an error)
    json(),
    // for some reason the npm package `debug` is getting bundled. debug has a
    // browser version, but rollup (or something) is choosing the node version
    // instead, which references process.stderr, which doesn't exist. this is
    // a workaround.
    replace({
      'process.stderr': '{}',
    }),
    !production && serve('public'),
  ],
};
