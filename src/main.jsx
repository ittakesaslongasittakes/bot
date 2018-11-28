import $ from "jquery";
import xs from "xstream";
import { run } from "@cycle/run";
import { makeDOMDriver, h1, div } from "@cycle/dom";
import onionify from "cycle-onionify";
import sampleCombine from "xstream/extra/sampleCombine";
require("./sass/style.scss"); // TODO: Move to webpack.config.js

function main({ DOM, onion }) {
  const state$ = onion.state$;
  const vdom$ = state$.map(s => (
    <div className="inject">
      <ul>
        <li>Выручка: {s.cash}</li>
        <li>В яблочко: {s.stat.atTheGoal}</li>
        <li>Мимо: {s.stat.beside}</li>
        {/*<li>*/}
        {/*<svg className="triangle-wrapper">*/}
        {/*<polygon*/}
        {/*points={`${s.triangle.a[0]},${s.triangle.a[1]} ${*/}
        {/*s.triangle.b[0]*/}
        {/*},${s.triangle.b[1]} ${s.triangle.c[0]},${s.triangle.c[1]}`}*/}
        {/*className="triangle"*/}
        {/*/>*/}
        {/*</svg>*/}
        {/*</li>*/}
      </ul>
    </div>
  ));

  const initReducer$ = xs.of(
    prev =>
      !prev
        ? {
            // def State
            cash: 0,
            offer: false,
            strike: 0,
            snap: 0,
            snapshot: 0,
            angle: 0,
            trend: false,
            triangle: {
              // [x, y]
              a: [0, 0],
              b: [0, 0],
              c: [0, 0]
            },
            stat: {
              atTheGoal: 0,
              beside: 0
            }
          }
        : prev
  );

  return {
    DOM: vdom$,
    onion: xs.merge(
      initReducer$,
      xs.periodic(5000).map(i => s => {
        const val = parseFloat($(".strike-button__price").text());
        return {
          ...s,
          snap: val,
          snapshot: parseInt(val.toString().substr(-2)),
          trend: s.snap > val
        };
      }),
      xs.periodic(200).map(i => s => {
        const val = parseFloat($(".strike-button__price").text());
        const angle =
          90 -
          Math.round(
            Math.atan(
              (s.triangle.b[0] - s.triangle.a[0]) /
                (s.triangle.b[1] - s.triangle.a[0])
            ) *
              (180 / Math.PI)
          );
        const offer =
          angle > 20
            ? {
                type: !s.trend ? "buy" : "sell",
                amt: val
              }
            : false;
        return {
          ...s,
          strike: val,
          offer: typeof s.offer === "object" ? s.offer : offer,
          angle,
          triangle: {
            ...s.triangle,
            a: [0, s.snap],
            b: [200, parseInt(val.toString().substr(-2))],
            c: [200, s.snap]
          }
        };
      }),
      xs.periodic(2000).map(i => s => {
        const val = parseFloat($(".strike-button__price").text());
        return {
          ...s,
          cash:
            typeof s.offer === "boolean"
              ? s.cash
              : s.offer.type === "sell"
                ? s.offer.amt < val
                  ? s.cash + 1
                  : s.cash - 1
                : s.offer.amt > val
                  ? s.cash + 1
                  : s.cash - 1,
          offer: false,
          stat: {
            atTheGoal:
              typeof s.offer === "boolean"
                ? s.stat.atTheGoal
                : s.offer.type === "sell"
                  ? s.offer.amt < val
                    ? s.stat.atTheGoal + 1
                    : s.stat.atTheGoal
                  : s.offer.amt > val
                    ? s.stat.atTheGoal + 1
                    : s.stat.atTheGoal,
            beside:
              typeof s.offer === "boolean"
                ? s.stat.beside
                : s.offer.type === "sell"
                  ? s.offer.amt < val
                    ? s.stat.beside
                    : s.stat.beside + 1
                  : s.offer.amt > val
                    ? s.stat.beside
                    : s.stat.beside + 1
          }
        };
      })
    )
  };
}

const wrappedMain = onionify(main);

run(wrappedMain, {
  DOM: makeDOMDriver(".plf-loader")
});
