import vec2 from '../vec2.js';

import prop0 from '../prose/book6/0';
import prop1 from '../prose/book6/1';
import prop2 from '../prose/book6/2';
import prop3 from '../prose/book6/3';
import prop4 from '../prose/book6/4';
import prop5 from '../prose/book6/5';
import prop6 from '../prose/book6/6';
import prop7 from '../prose/book6/7';
import prop8 from '../prose/book6/8';
import prop9 from '../prose/book6/9';
import prop10 from '../prose/book6/10';
import prop11 from '../prose/book6/11';
import prop12 from '../prose/book6/12';
import prop13 from '../prose/book6/13';
import prop14 from '../prose/book6/14';
import prop15 from '../prose/book6/15';
import prop16 from '../prose/book6/16';
import prop17 from '../prose/book6/17';
import prop18 from '../prose/book6/18';
import prop19 from '../prose/book6/19';
import prop20 from '../prose/book6/20';
import prop21 from '../prose/book6/21';
import prop22 from '../prose/book6/22';
import prop23 from '../prose/book6/23';
import prop24 from '../prose/book6/24';
import prop25 from '../prose/book6/25';
import prop26 from '../prose/book6/26';
import prop27 from '../prose/book6/27';
import prop28 from '../prose/book6/28';
import prop29 from '../prose/book6/29';
import prop30 from '../prose/book6/30';
import prop31 from '../prose/book6/31';
import prop32 from '../prose/book6/32';
import prop33 from '../prose/book6/33';

function book6(rg)
{
  return [
function()
{
  return {
    prose: prop0,
  };
},

function()
{
  const A = [200, 50];
  const C = [200, 250];
  const l1 = 50;
  const l2 = 65;
  const B = vec2.sub(C, [l1, 0]);
  const D = vec2.add(C, [l2, 0]);
  const E = vec2.sub(A, [l1, 0]);
  const F = vec2.add(A, [l2, 0]);
  const G = vec2.sub(C, [l1 * 2, 0]);
  const H = vec2.sub(C, [l1 * 3, 0]);
  const K = vec2.add(C, [l2 * 2, 0]);
  const L = vec2.add(C, [l2 * 3, 0]);
  return {
    prose: prop1,
    points: { A, B, C, D, E, F, G, H, K, L }
  };
},

function()
{
  const A = [50, 50];
  const B = [150, 300];
  const C = [300, 300];
  const ab = vec2.sub(B, A);
  const ac = vec2.sub(C, A);
  const D = vec2.add(A, vec2.scale(ab, 0.7));
  const E = vec2.add(A, vec2.scale(ac, 0.7));

  return {
    prose: prop2,
    points: { A, B, C, D, E }
  };
},

function()
{
  const base = 300, h = 150;
  const B = [50, base];
  const A = [240, base - h];
  const C = [300, base];
  const ba = vec2.sub(A, B);
  const len_ba = vec2.len(ba);
  const uba = vec2.scale(ba, 1/len_ba);
  const len_ac = vec2.dist(A, C);
  const ae = vec2.scale(uba, len_ac);
  const E = vec2.add(A, ae);
  const ec = vec2.sub(C, E);
  const s_ad = len_ba / (len_ba + len_ac);
  const ad = vec2.scale(ec, s_ad);
  const D = vec2.add(A, ad);

  return {
    prose: prop3,
    points: { A, B, C, D, E }
  };
},

function()
{
  const A = [300, 150];
  const B = [50, 300];
  const C = [230, 300];
  const bc = vec2.sub(C, B);
  const ca = vec2.sub(A, C);
  const E = vec2.add(B, vec2.scale(bc, 1.5));
  const D = vec2.add(E, vec2.scale(ca, 0.5));
  const F = vec2.add(E, vec2.scale(ca, 1.5));

  return {
    prose: prop4,
    points: { A, B, C, D, E, F }
  };
},

function()
{
  const B = [50, 320];
  const C = [200, 300];
  const cb = vec2.sub(B, C);
  const theta = Math.PI * 0.6;
  const ca = vec2.scale(vec2.rot(cb, theta), 1.3);
  const A = vec2.add(C, ca);
  const F = [400, 200];
  const E = vec2.add(F, vec2.scale(cb, 0.6));
  const D = vec2.add(F, vec2.scale(ca, 0.6));
  const G = vec2.add(F, vec2.scale(vec2.rot(ca, -2*theta), 0.6));

  return {
    prose: prop5,
    points: { A, B, C, D, E, F, G }
  };
},

function()
{
  const A = [70, 50];
  const B = [50, 300];
  const ab = vec2.sub(B, A);
  const theta = -Math.PI * 0.2;
  const ac = vec2.scale(vec2.rot(ab, theta), 1.2);
  const C = vec2.add(A, ac);
  const de = vec2.scale(ab, 0.5);
  const df = vec2.scale(vec2.rot(de, theta), 1.2);
  const dg = vec2.rot(de, 2*theta);
  const D = [270, 50];
  const [E, F, G] = [de, df, dg].map(v => vec2.add(D, v));

  return {
    prose: prop6,
    points: { A, B, C, D, E, F, G }
  };
},

function()
{
  const A = [150, 50];
  const B = [50, 150];
  const ab = vec2.sub(B, A);
  const theta = -Math.PI * 0.3;
  const ac = vec2.scale(vec2.rot(ab, theta), 1.3);
  const ag = vec2.scale(ac, 0.8);
  const C = vec2.add(A, ac);
  const G = vec2.add(A, ag);

  const D = [300, 100];
  const de = vec2.scale(ab, 0.6);
  const E = vec2.add(D, de);
  const df = vec2.scale(ac, 0.6);
  const F = vec2.add(D, df);

  return {
    prose: prop7,
    points: { A, B, C, D, E, F, G }
  };
},

function()
{
  const A = [250, 50];
  const B = [50, 250];
  const ab = vec2.sub(B, A);
  const ac = vec2.rot(ab, -Math.PI/2);
  const C = vec2.add(A, ac);
  const bd = vec2.scale(vec2.sub(C, B), 0.5);
  const D = vec2.add(B, bd);

  return {
    prose: prop8,
    points: { A, B, C, D }
  };
},

function()
{
  const A = [50, 300];
  const at = [350, 0];
  const At = vec2.add(A, vec2.scale(at, 1.2));
  const av = vec2.scale(vec2.rot(at, -Math.PI*0.2), 0.8);
  const Av = vec2.add(A, vec2.scale(av, 1.4));
  const B = vec2.add(A, vec2.scale(at, 0.9));
  const C = vec2.add(A, vec2.scale(av, 0.9));
  const D = vec2.add(A, vec2.scale(av, 0.3));
  const E = vec2.add(A, vec2.scale(av, 0.6));
  const F = vec2.add(A, vec2.scale(at, 0.3));

  return {
    prose: prop9,
    points: { A, B, C, D, E, F, At, Av }
  };
},

function()
{
  const A = [50, 300];
  const C = [400, 50];
  const B = [330, 300];
  const ac = vec2.sub(C, A);
  const ab = vec2.sub(B, A);
  const D = vec2.add(A, vec2.scale(ac, 0.25));
  const E = vec2.add(A, vec2.scale(ac, 0.65));
  const F = vec2.add(A, vec2.scale(ab, 0.25));
  const G = vec2.add(A, vec2.scale(ab, 0.65));
  const fd = vec2.sub(D, F);
  const H = vec2.add(G, fd);
  const K = vec2.add(B, fd);

  return {
    prose: prop10,
    points: { A, B, C, D, E, F, G, H, K }
  };
},

function()
{
  const A = [230, 50];
  const C = [250, 200];
  const ac = vec2.sub(C, A);
  const r_ac = vec2.rot(ac, Math.PI * 0.22);
  const ab = vec2.scale(r_ac, 0.7);
  const ad = vec2.scale(r_ac, 1.7);
  const ae = vec2.scale(ac, (1.7/0.7));
  const [B, D, E] = [ab, ad, ae].map(v => vec2.add(A, v));

  return {
    prose: prop11,
    points: { A, B, C, D, E }
  };
},

function()
{
  const a = 180, b = 100, c = 150;
  const D = [50, 350];
  const udf = [1, 0];
  const ude = vec2.rot(udf, -Math.PI * 0.2);
  const dg = vec2.scale(ude, a);
  const de = vec2.scale(ude, a+b);
  const dh = vec2.scale(udf, c);
  const df = vec2.scale(udf, c*(a+b)/a);
  const [G, E, H, F] = [dg, de, dh, df].map(v => vec2.add(D, v));

  return {
    prose: prop12,
    points: { D, E, F, G, H },
    mags: [
      { l: 'A', m: a, p: [50, 50] },
      { l: 'B', m: b, v: 40 },
      { l: 'C', m: c, v: 40 },
    ],
  };
},

function()
{
  const a = 250, b = 120, r= (a + b)/ 2;
  const A = [50, 300];
  const O = vec2.add(A, [r, 0]);
  const B = vec2.add(A, [a, 0]);
  const C = vec2.add(B, [b, 0]);
  const D = vec2.sub(B, [0, Math.sqrt(a * b)]);

  return {
    prose: prop13,
    points: { A, B, C, D, O }
  };
},

function()
{
  const u = [1, 0];
  const v = vec2.rot(u, -Math.PI*0.4);
  const B = [200, 150];
  const v1 = vec2.scale(v, 100);
  const v2 = vec2.scale(v, 150);
  const E = vec2.add(B, v1);
  const D = vec2.sub(B, v2);
  const u1 = vec2.scale(u, 120);
  const u2 = vec2.scale(u, 180);
  const [A, F, H] = [D, B, E].map(pt => vec2.sub(pt, u1));
  const [G, C] = [B, E].map(pt => vec2.add(pt, u2));

  return {
    prose: prop14,
    points: { A, B, C, D, E, F, G, H }
  };
},

function()
{
  const A = [200, 200];
  const B = [150, 50];
  const C = [350, 50];
  const ba = vec2.sub(A, B);
  const ca = vec2.sub(A, C);
  const D = vec2.add(A, vec2.scale(ca, 1.1));
  const E = vec2.add(A, vec2.scale(ba, 1/1.1));

  return {
    prose: prop15,
    points: { A, B, C, D, E }
  };
},

function()
{
  const a = 200, c = a*0.7, e = 120, f = e * 0.7;
  const A = [50, 150];
  const B = vec2.add(A, [a, 0]);
  const G = vec2.sub(A, [0, f]);
  const K = vec2.sub(B, [0, f]);
  const C = vec2.add(A, [70+ a, 0]);
  const D = vec2.add(C, [c, 0]);
  const H = vec2.sub(C, [0, e]);
  const L = vec2.sub(D, [0, e]);

  return {
    prose: prop16,
    points: { A, B, C, D, G, H, K, L },
    mags: [
      { l: 'E', m: e, p: [50, 200] },
      { l: 'F', m: f, p: [C[0], 200] },
    ]
  };
},

function()
{
  const b = 120, c = 90, a = b * b / c;
  return {
    prose: prop17,
    mags: [
      { l: 'A', m: a, p: [50, 50] },
      { l: 'B', m: b, v: 50 },
      { l: 'C', m: c, v: 50 },
      { l: 'D', m: b, p: [220, 100] },
    ]
  };
},

function()
{
  return {
    prose: prop18,
  };
},

function()
{
  return {
    prose: prop19,
  };
},

function()
{
  return {
    prose: prop20,
  };
},

function()
{
  return {
    prose: prop21,
  };
},

function()
{
  return {
    prose: prop22,
  };
},

function()
{
  return {
    prose: prop23,
  };
},

function()
{
  return {
    prose: prop24,
  };
},

function()
{
  return {
    prose: prop25,
  };
},

function()
{
  return {
    prose: prop26,
  };
},

function()
{
  return {
    prose: prop27,
  };
},

function()
{
  return {
    prose: prop28,
  };
},

function()
{
  return {
    prose: prop29,
  };
},

function()
{
  return {
    prose: prop30,
  };
},

function()
{
  return {
    prose: prop31,
  };
},

function()
{
  return {
    prose: prop32,
  };
},

function()
{
  return {
    prose: prop33,
  };
},

]
}

export default book6;
