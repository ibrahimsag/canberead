import rough from 'roughjs';
import hsluv from 'hsluv';
import {create} from 'jss';
import preset from 'jss-preset-default';

import vec2 from './vec2.js';

import style from './style.js';
import html from './html.js';

let colors = {
  bright: hsluv.hsluvToHex([0, 0, 100]),
  sentence: hsluv.hsluvToHex([0, 0, 75]),
  dim: hsluv.hsluvToHex([0, 0, 50]),
  link: hsluv.hpluvToHex([140, 100, 50]),
  link_hover: hsluv.hpluvToHex([140, 100, 60]),
  hover: hsluv.hpluvToHex([330, 100, 60]),
  hover_bright: hsluv.hpluvToHex([330, 100, 80]),
  make: hsluv.hpluvToHex,
};

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Create DOM node, set attributes.
 *
 * @param {String} name
 * @param {Object} [attrs]
 * @return Element
 */
function de(name, attrs)
{
  const element = document.createElement(name)

  if(attrs)
  {
    for (const attr in attrs)
    {
      element.setAttribute(attr, attrs[attr])
    }
  }

  return element
}
function se(name, attrs)
{
  const element = document.createElementNS(SVG_NS, name)

  if(attrs)
  {
    for (const attr in attrs)
    {
      element.setAttribute(attr, attrs[attr])
    }
  }

  return element
}

function makeRG()
{
  const rsvg = rough.svg(de('svg'));

  const roughopts = { roughness: 0.1, stroke: colors.dim, strokeWidth: 1 };

  function curve(vs, o)
  {
    return rsvg.generator.curve(vs, {...roughopts, ...o});
  }

  function polygon(vs, o)
  {
    return rsvg.generator.polygon(vs, {...roughopts, ...o});
  }

  function line(a, b, o)
  {
    return rsvg.generator.line(a[0], a[1], b[0], b[1], {...roughopts, ...o});
  }

  function circle(c, d, o)
  {
    return rsvg.generator.circle(c[0], c[1], d, {...roughopts, ...o});
  }

  function anglecurve(a, o, b)
  {
    let [d1, d2] = [a, b].map(x => vec2.sub(x, o)).map(d => vec2.scale(d, 1/vec2.len(d)));

    let det = d1[0]*d2[1] - d1[1]*d2[0];
    if(det < 0)
    {
       [d2, d1] = [d1, d2];
    }

    let alpha = Math.acos(vec2.dot(d1, d2));
    let s = 20;
    if(alpha < Math.PI/4)
      s = 30;

    let samples = [0, 0.25, 0.5, 0.75, 1];
    if(alpha > Math.PI / 2)
      samples = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
    let ps = samples.map(a => vec2.add(o, vec2.scale(vec2.rot(d1, alpha*a), s)));
    return curve(ps, {strokeWidth: 10});
  }

  function angle(a, o, b)
  {
    return [anglecurve(a, o, b), line(o, a), line(o, b)];
  }

  function arc(c, a, b, o)
  {
    let ca = vec2.sub(a, c);
    let cb = vec2.sub(b, c);
    let d = vec2.len(ca);
    let uca = vec2.scale(ca, 1/d);
    let start = (Math.atan2(uca[1], uca[0]) + Math.PI*2) % (Math.PI * 2);
    let ucb = vec2.scale(cb, 1/d);
    let end = (Math.atan2(ucb[1], ucb[0]) + Math.PI*2) % (Math.PI*2);
    if(start > end)
      end += Math.PI * 2;
    return rsvg.generator.arc(c[0], c[1], d*2, d*2, start, end, false, {...roughopts, ...o});
  }

  function gnomon(c, d, e)
  {
    return arc(c, d, e, {strokeLineDash: [5, 4]});
  }

  function tick(pt)
  {
    let w = [0, 5];
    let a = vec2.sub(pt, w), b = vec2.add(pt, w);
    return line(a, b);
  }

  function makeHighlight(figure, layer, h) {
    let shapes;
    if(h.typ === 'point')
    {
      shapes = [circle(figure.points[h.name], 5, { strokeWidth: 2 })];
    }
    else if(h.typ == 'line')
    {
      let f = 0, l = h.name.length-1;
      shapes = [line(figure.points[h.name[f]], figure.points[h.name[l]])];
    }
    else if(h.typ == 'arcc')
    {
      let c = h.arg;
      if(/[A-Z]/.test(c))
      {
        let center = figure.points[c];
        shapes = [arc(center, figure.points[h.name[h.name.length-1]], figure.points[h.name[0]])];
      }
      else
      {
        return undefined;
      }
    }
    else if(h.typ == 'arc')
    {
      let c = h.arg;
      if(/[A-Z]/.test(c))
      {
        let center = figure.points[c];
        shapes = [arc(center, figure.points[h.name[0]], figure.points[h.name[h.name.length-1]])];
      }
      else
      {
        return undefined;
      }
    }
    else if(h.typ == 'circle')
    {
      let c = h.arg;
      if(/[A-Z]/.test(c))
      {
        let center = figure.points[c];
        let a = figure.points[h.name[0]];
        shapes = [circle(center, 2 * vec2.dist(center, a))];
      }
      else
      {
        return undefined;
      }
    }
    else if(h.typ == 'polygon')
    {
      let ns = h.name;
      if (h.name.length == 2)
      {
        ns = figure.polygonl[h.name];
        if(!ns)
        {
          console.error('unknown polygon name', h.name);
        }
      }
      let points = ns.split('').map(l => figure.points[l]);
      shapes = [polygon(points)];
    }
    else if(h.typ == 'angle')
    {
      let [a, o, b] = h.name.split('').map(l => figure.points[l]);
      shapes = angle(a, o, b);
    }
    else if(h.typ == 'magnitude')
    {
      let i_begin, i_end;
      if(h.name.length == 1)
      {
        i_begin = figure.indices[h.name[0]];
        i_end = figure.indices[h.name[0] + 'e'];
      }
      else if(h.name.length > 1)
      {
        i_begin = figure.indices[h.name[0]];
        i_end = figure.indices[h.name[h.name.length-1]];
      }
      else
      {
        console.error('unknown magnitude');
      }

      if(i_begin > i_end)
        [i_begin, i_end] = [i_end, i_begin]

      shapes = figure.ticks.slice(i_begin, i_end+1).map(tick);
      shapes.push(line(figure.ticks[i_begin], figure.ticks[i_end]));
    }
    else if(h.typ == 'given' && figure.given && figure.given[h.name])
    {
      shapes = figure.given[h.name].map(s => ({ ...s, options: {...s.options} }));
    }
    else
    {
      console.error('Unknown highlight: ', h.typ, h.name);
      return undefined;
    }

    if(layer === 'sentence')
    {
      shapes.forEach(s =>
        {
          if(h.typ === 'angle' && (s.shape == 'arc' || s.shape === 'curve'))
          {
            s.options["stroke"] = colors.dim;
          }
          else
          {
            s.options["stroke"] = colors.sentence;
          }
        });
    }
    else if(layer === 'bright')
    {
      shapes.forEach(s =>
        {
          s.options["stroke"] = colors.bright;
          s.options["strokeWidth"] += 1;
        });
    }
    else if(layer === 'hover_bright')
    {
      shapes.forEach(s =>
        {
          s.options["stroke"] = colors.hover_bright;
          s.options["strokeWidth"] += 1;
        });
    }

    return shapes;
  }
  return { tick, arc, gnomon, anglecurve, angle, curve, line, polygon, circle, makeHighlight, draw: rsvg.draw.bind(rsvg) }
}

function makePR(rg, svg, cs)
{
  let proxy = {};

  function prepareMags(section)
  {
    let mags = section.mags;
    let last_pos = [0, 0];
    let pos = [0, 0];
    section.ticks = [];
    section.indices = {};

    for(var i = 0; i < mags.length; i++)
    {
      let mag = mags[i];
      if(mag.p)
      {
        pos = mag.p;
        last_pos = pos;
      }
      else if(mag.v)
      {
        pos = vec2.add(last_pos, [0, mag.v]);
        last_pos = pos;
      }

      if(mag.p || mag.v)
      {
        section.shapes.push(rg.tick(pos));
        section.indices[mag.l] = section.ticks.length;
        section.ticks.push(pos);
        section.letters[mag.l] = [2.9, 2];
      }
      else if(mag.m)
      {
        section.letters[mag.l] = [1, 2];
        section.indices[mag.l] = section.ticks.length - 1;
      }
      else
      {
        section.letters[mag.l] = [1, 2];
        section.indices[mag.l] = section.ticks.length - 1;
      }
      section.points[mag.l] = pos;

      if(mag.m)
      {
        let n = mag.n ? mag.n : 1;
        for(var k = 0; k < n; k++)
        {
          let prev_pos = pos;
          pos = vec2.add(prev_pos, [mag.m, 0]);
          section.shapes.push(rg.tick(pos));
          section.shapes.push(rg.line(prev_pos, pos));
          section.ticks.push(pos);
          section.indices[mag.l + 'e'] = section.ticks.length - 1;
        }
      }
    }

    return section;
  }

  function prepareLetterOffsets(figure, smallLetters)
  {
    figure.letterOffsets = {};
    for(var i in figure.letters)
    {
      let letter = figure.letters[i];
      let shouldBeSmall = smallLetters || (figure.smallletters && figure.smallletters.indexOf(i) > -1);

      let proj = (s, l) => {
        switch(s)
        {
          case 0:
            return [0.1 * l, -0.1 * l];
            break;
          case 1:
            return [-0.5, -0.2 * l];
            break;
          case 2:
            return [-1 - 0.2*l, -0.2 * l];
            break;
          case 3:
            return [-1 - 0.2*l, 0.5];
            break;
          case 4:
            return [-1, 1];
            break;
          case 5:
            return [-0.5, 1 + 0.1*l];
            break;
          case 6:
            return [0.3*l, 0.9 + 0.1*l];
            break;
          case 7:
            return [0.2*l, 0.5];
            break;
          default:
            return [0.1*l, -0.1*l];
            break;
        }
      }
      let inj = (s) => (s+8)%8;
      let s = inj(letter[0]);
      let l = (letter[1] || 1) + (shouldBeSmall ? 1 : 0);
      let s1 = Math.floor(s), s2 = Math.ceil(s);
      let r = s - s1;
      let p1 = proj(s1, l), p2 = proj(s2, l);
      let dir = vec2.add(p1, vec2.scale(vec2.sub(p2, p1), r));

      let m = {width: 14.45, height: 23};
      if(shouldBeSmall)
        m = {width: 9.64, height: 14};
      figure.letterOffsets[i] = [dir[0] * m.width, dir[1] * m.height];
    }
  }

  function prepareFigure(figure, smallLetters)
  {
    if(!figure.points) figure.points = {};
    if(!figure.shapes) figure.shapes = [];
    if(!figure.letters) figure.letters = {};
    if(figure.mags && !figure.magsProcessed)
    {
      prepareMags(figure);
      figure.magsProcessed = true;
    }

    if(!figure.letterOffsets)
    {
      prepareLetterOffsets(figure, smallLetters);
    }

    figure.prepared = true;
  }

  function prepareLetterOverlay(figure, letterColor, highlightFigure, smallLetters)
  {
    let shapes = [];
    for(var i in figure.letters)
    {
      let letter = figure.letters[i];
      let shouldBeSmall = smallLetters || (figure.smallletters && figure.smallletters.indexOf(i) > -1);
      var el = se('text');
      el.setAttribute('font-family', 'Nale');
      el.setAttribute('font-size', shouldBeSmall ? 16 : 24);
      let fillcolor = colors.dim;
      if(highlightFigure && letterColor[i])
      {
        fillcolor = letterColor[i];
      }
      el.setAttribute('fill', fillcolor);
      el.textContent = i;

      let pos = vec2.add(figure.points[i], figure.letterOffsets[i]);
      el.setAttribute('x', pos[0]);
      el.setAttribute('y', pos[1]);
      shapes.push(el);
    }
    return shapes;
  }

  function prepareProse(section)
  {
    let lastSeenFigureIndex = 0;
    section.i_count = 0;
    section.i_p = [];
    section.paragraphs = section.prose.split('\n\n').map(paragraphProse =>
      {
        return paragraphProse.split('\n').map(sentenceProse =>
          {
            let k = section.i_p.length;
            section.i_p.push(section.i_count);
            let i_RE = /(\{[^\}]*\}|\[[^\]]*\])/g;
            let sentenceParts = sentenceProse.split(i_RE);
            let seen = false;
            let parts = sentenceParts.filter(x=>x).map(part =>
              {

                let nameRE = /\{([a-zA-Z]+)\}/;
                let nm = part.match(nameRE);
                let overlayRE = /\{([a-zA-Z]+) ([a-z]+)( [A-Z])?\}/;
                let om = part.match(overlayRE);
                let figureRE = /\{figure ([0-9])\}/;
                let fm = part.match(figureRE);
                let propsRE = /\[Props. [^\]]*\]/;
                let rsm = part.match(propsRE);
                let propRE = /\[Prop. ([0-9]+.[0-9]+)([^\]]*)\]/;
                let rm = part.match(propRE);
                let r;

                if(rm)
                {
                  let pref = rm[1], rest = rm[2].split(', ');
                  if(rest[0] == ' lem. II')
                    pref += '-lemII'
                  else if(rest[0] == ' lem. I')
                    pref += '-lemI'
                  else if(rest[0] == ' lem.')
                    pref += '-lem'
                  r = { part: { prefs: [{ prefName: rm[0], pref }]} };
                }
                else if(rsm)
                {
                  let n = 0;
                  let ls = rsm[0].split(', ').map(s => {
                    let re = /([0-9]+.[0-9]+)/;
                    let m = s.match(re);
                    let pref = m[1];
                    if(s.match(/lem. II/))
                      pref += '-lemII';
                    else if(s.match(/lem. I/))
                      pref += '-lemI';
                    else if(s.match(/lem./))
                      pref += '-lem'
                    n++;
                    if(m)
                    {
                      return {prefName: (n > 1 ? ', ' : '') + s, pref};
                    }
                    else
                    {
                      return {prefName: s + ' !!!!', pref: null};
                    }
                  });;
                  r = { part: { prefs: ls } };
                }
                else if(fm)
                {
                  let figureInd = parseInt(fm[1]);
                  if(isNaN(figureInd))
                  {
                    console.error("figure index: ", figureInd);
                  }
                  r = { part: { figureInd } };

                  lastSeenFigureIndex = figureInd;
                }
                else if(nm)
                {
                  seen = true;
                  let name = nm[1];
                  r = { part: { name } };
                }
                else if(om)
                {
                  seen = true;
                  r = { part: { name: om[1], typ: om[2] }};
                  if(om[3])
                    r.part.arg = om[3].trim();
                }
                else {
                  r = { part: { text: part } };
                }

                if(nm || om)
                {
                  r.i = section.i_count;
                  r.k = k;
                  r.lastSeenFigureIndex = lastSeenFigureIndex;
                  section.i_count++;
                }

                return r;
              });
            if(!seen)
              section.i_count++;
            return {parts, k, seen};
          });
      });
    section.i_p.push(section.i_count);
  }

  function scrollToSentenceIfNecessary(el)
  {
    setTimeout(() => {

      let pt = window.scrollY, ph = window.innerHeight - 50;
      let p = { t: pt, b: pt + ph}
      let c = { t: el.offsetTop, b: el.offsetTop + el.offsetHeight };
      if((p.t > (c.t - 10)) || (p.b < (c.b + 10)))
      {
        let t = Math.max(c.t - ph * 0.38, 76);
        window.scrollTo(0, t);
      }
    })
  }

  let us = [];
  let vs = [];
  let us_ = [];
  let vs_ = [];
  let last_p_id = -1;

  function prepareDOM(proseEl, section)
  {
    us = [];
    us_ = [];
    vs = [];
    vs_ = [];
    while(proseEl.firstChild)
      proseEl.removeChild(proseEl.firstChild);

    section.paragraphs.forEach(sentences =>
    {
      let paragraphEl = de('p');
      sentences.forEach(a =>
      {
        let {parts, k, seen} = a;

        let sentenceEl = de('span');
        sentenceEl.className = cs.sentence;

        function prepPart(a)
        {
          let r, { part, i, k, lastSeenFigureIndex } = a;
          if(part.text)
          {
            sentenceEl.append(part.text);
          }
          else if(part.prefs)
          {
            let f = l => {
              let a = de('a');
              a.setAttribute('pref', l.pref);
              a.innerText = l.prefName;
              return a;
            }

            sentenceEl.append(...part.prefs.map(f))
          }
          else if(part.name)
          {
            let el = de('span');
            el.innerText = part.name;
            el.className = cs.name;
            el.dataset.i = i;
            sentenceEl.append(el);
            r = {part, i, k, lastSeenFigureIndex, el};
            us.push(r);
          }
        }
        parts.forEach(prepPart);

        sentenceEl.dataset.i = section.i_p[k+1] - 1
        if(!seen)
        {
          us.push(null);
        }

        vs.push({sentenceEl, k});
        paragraphEl.append(sentenceEl, ' ');
      });
      proseEl.appendChild(paragraphEl);
    })
  }

  function refreshImgLetters(imgEl, letters, letterColor)
  {
    imgEl.querySelectorAll('text').forEach(el => imgEl.removeChild(el));

    for(var l in letters) {
      let d = letters[l];
      var el = se('text');
      el.textContent = l;
      el.setAttribute('font-family', 'Nale');
      el.setAttribute('font-size', d.s);
      el.setAttribute('fill', letterColor[l] || colors.dim);
      el.setAttribute('x', d.x);
      el.setAttribute('y', d.y);
      imgEl.appendChild(el);
    }
  }

  function present(o, section, hover_o, no_scroll)
  {
    if(o == null)
    {
      o = section.i || 0;
    }
    section.i = o;

    if(!section.paragraphs)
    {
      prepareProse(section);
    }

    if(!section.prepared)
    {
      if(section.figures)
      {
        section.figures.forEach(figure => {
          prepareFigure(figure, true);
        });
      }
      else
      {
        prepareFigure(section, false);
      }
    }

    if(o < 0)
    {
      return present(section.i_count-2, section);
    }
    else if (o >= section.i_count-1 && section.i_count > 0)
    {
      return present(0, section);
    }

    let proseEl = document.querySelector('#proseContent');
    let auxColumnEl = document.querySelector('#auxColumn');
    if(last_p_id != section.id)
    {
      let titleEl = document.querySelector('#proseTitle');
      titleEl.innerText = section.title;

      prepareDOM(proseEl, section);

      auxColumnEl.querySelectorAll('.given').forEach(el => auxColumnEl.removeChild(el));

      let installSVG = () => {
        let mark = de('div');
        mark.className = 'given';
        mark.style.margin = "10px";
        if(section.imgData)
        {
          mark.innerHTML = section.imgData.svgStr;
          let imgEl = mark.querySelector('svg');
          refreshImgLetters(imgEl, section.imgData.letters, {});
        }
        else if(section.imgsData)
        {
          mark.innerHTML = section.imgsData.map(d => d.svgStr).join('');
          let imgEls = mark.querySelectorAll('svg');

          for(let i = 0; i< section.imgsData.length; i++)
          {
            let imgEl = imgEls[i];
            let letters = section.imgsData[i].letters;
            refreshImgLetters(imgEl, letters, {});
          }
        }

        auxColumnEl.insertBefore(mark, auxColumnEl.firstChild);
      }

      if(section.img && !section.imgData)
      {
        fetch(section.img).then(resp => resp.json()).then(d =>
        {
          if(last_p_id != section.id)
            return;

          section.imgData = d;

          installSVG()
        })
      }
      else if(section.imgs && !section.imgsData)
      {
        let ps = section.imgs.map(img => fetch(img).then(resp => resp.json()));
        Promise.all(ps).then(ds =>
        {
          if(last_p_id != section.id)
            return;

          section.imgsData = ds;

          installSVG()
        })
      }
      else if(section.imgData || section.imgsData)
      {
        installSVG();
      }
    }

    function findMaxLTE(ps, i)
    {
      let lo = 0, hi = ps.length -1;
      let found = false;
      while(!found && lo + 1 < hi)
      {
        let k = Math.floor((lo+hi)/2);
        if(ps[k] == i)
        {
          found = true;
          lo = k;
        }
        else if(ps[k] < i)
          lo = k;
        else
          hi = k;
      }
      return lo;
    }

    let k_focus = findMaxLTE(section.i_p, o);
    let k_hover = !isNaN(hover_o) ? findMaxLTE(section.i_p, hover_o): null;;

    let nearHighlights = [];
    let hoverHighlights = [];
    let highlights = [];
    let figureIndex = 0;
    let hoverFigureIndex = 0;

    while(vs_.length > 0)
    {
      let v = vs_.pop();
      v.sentenceEl.style['color'] = colors.dim;
    }

    while(us_.length > 0)
    {
      let a = us_.pop();
      if(!a) continue;
      a.el.style['color'] = colors.dim;
    }

    if (k_hover!=null)
    {
      let hover = vs[k_hover];
      hover.sentenceEl.style['color'] = colors.hover;
      vs_.push(hover);

      us.slice(section.i_p[k_hover], section.i_p[k_hover+1]).forEach(u =>
      {
        if(!u) return;
        u.el.style['color'] = colors.hover;
        us_.push(u);
      });
    }

    let focus = vs[k_focus];
    focus.sentenceEl.style['color'] = colors.sentence;
    vs_.push(focus);
    if(!no_scroll)
    {
      scrollToSentenceIfNecessary(focus.sentenceEl);
    }

    let seenMarks = {};
    us.slice(section.i_p[k_focus], section.i_p[k_focus+1]).forEach(u =>
    {
      if(!u) return;
      u.el.style['color'] = colors.sentence;
      let part = u.part, hash = JSON.stringify(part);
      if(!seenMarks[hash])
      {
        nearHighlights.push(part);
        seenMarks[hash] = true;
      }
      us_.push(u);
    });

    if(!isNaN(hover_o) && hover_o != o && us[hover_o])
    {
      let hover = us[hover_o];
      hoverHighlights.push(hover.part);
      hoverFigureIndex = hover.lastSeenFigureIndex;
      hover.el.style['color'] = colors.hover_bright;
      us_.push(hover);
    }

    if(us[o])
    {
      let focus = us[o];
      highlights.push(focus.part);
      figureIndex = focus.lastSeenFigureIndex;
      focus.el.style['color'] = colors.bright;
      us_.push(focus);
    }

    let m_o = document.querySelector('#move-on');
    let m_b = document.querySelector('#move-back');
    let h_o = colors.sentence, h_b = colors.dim;

    if (o === section.i_p[k_focus+1] - 1)
    {
      h_o = colors.dim;
      h_b = colors.sentence;
      m_o.innerText = "next sentence";
    }
    else
    {
      m_o.innerText = "next symbol";
    }
    m_o.style['background-color'] = h_o;
    m_b.style['background-color'] = h_b;

    while(svg.firstChild)
      svg.removeChild(svg.firstChild);

    let hs = highlights.filter(h=>h.typ);
    let nhs = nearHighlights.filter(h=>h.typ);
    let hhs = hoverHighlights.filter(h=>h.typ);
    let g = se('g');
    svg.append(g);
    if(!section.figures)
    {
      let figure = section;
      g.append(...figure.shapes.map(rg.draw));

      let f = l => h => svg.append(...rg.makeHighlight(figure, l, h).map(rg.draw));
      nhs.forEach( f('sentence') );
      hs.forEach( f('bright') );

      hhs.forEach( f('hover_bright') );

      let letterColor = {};
      f = c => h => {
        h.name.split('').forEach(l => letterColor[l] = c);
      }
      nearHighlights.forEach(f(colors.sentence));
      highlights.forEach(f(colors.bright));
      hoverHighlights.forEach(f(colors.hover_bright));


      let els = prepareLetterOverlay(figure, letterColor, true, false);
      svg.append(...els);
    }
    else
    {
      for(var i = 0; i < section.figures.length; i++)
      {
        let figure = section.figures[i];
        g.append(...figure.shapes.map(rg.draw));

        let highlightFigure = figureIndex == 0 || figureIndex == i+1;
        let hoverHighlightFigure = hoverFigureIndex == 0 || hoverFigureIndex == i+1;

        let f = l => h => svg.append(...rg.makeHighlight(figure, l, h).map(rg.draw));
        if(highlightFigure)
        {
          nhs.forEach( f('sentence') );
          hs.forEach( f('bright') );
        }
        if(hoverHighlightFigure)
        {
          hhs.forEach( f('hover_bright') );
        }

        let letterColor = {};
        f = c => h => {
          h.name.split('').forEach(l => letterColor[l] = c);
        }
        if(figureIndex == 0 || figureIndex == i+1)
        {
          nearHighlights.forEach(f(colors.sentence));
          highlights.forEach(f(colors.bright));
        }
        if(hoverFigureIndex == 0 || hoverFigureIndex == i+1)
        {
          hoverHighlights.forEach(f(colors.hover_bright));
        }

        let els = prepareLetterOverlay(figure, letterColor, highlightFigure, true);
        svg.append(...els);
      }
    }

    if(last_p_id != section.id)
    {
      let r = g.getBBox();
      svg.setAttribute('viewBox', [r.x - 50, r.y - 50, r.width+100, r.height+100].join(' '));
      svg.setAttribute('width', r.width + 100);
      svg.setAttribute('height', r.height + 100);
    }

    last_p_id = section.id;

    if(section.img && section.imgData)
    {
      let imgEl = auxColumnEl.querySelector('.given svg');
      let letterColor = {};
      let f = c => h => {
        h.name.split('').forEach(l => letterColor[l] = c);
      }
      if(figureIndex == 0 || figureIndex == i+1)
      {
        nearHighlights.forEach(f(colors.sentence));
        highlights.forEach(f(colors.bright));
      }
      if(hoverFigureIndex == 0 || hoverFigureIndex == i+1)
      {
        hoverHighlights.forEach(f(colors.hover_bright));
      }

      refreshImgLetters(imgEl, section.imgData.letters, letterColor);
    }
    else if(section.imgs && section.imgsData)
    {
      let imgEls = auxColumnEl.querySelectorAll('.given svg');
      for(let i = 0; i < section.imgsData.length; i++)
      {
        let imgEl = imgEls[i];
        let letters = section.imgsData[i].letters;
        let letterColor = {};
        let f = c => h => {
          h.name.split('').forEach(l => letterColor[l] = c);
        }
        if(figureIndex == 0 || figureIndex == i+1)
        {
          nearHighlights.forEach(f(colors.sentence));
          highlights.forEach(f(colors.bright));
        }
        if(hoverFigureIndex == 0 || hoverFigureIndex == i+1)
        {
          hoverHighlights.forEach(f(colors.hover_bright));
        }

        refreshImgLetters(imgEl, letters, letterColor);
      }
    }

    proxy.moveon = () => { present(o + 1, section); };
    proxy.moveback = () => { present(o - 1, section); };

    let forClick = false, forCancel = null;
    proseEl.onmouseout = (e) =>
    {
      if(forClick)
        return;

      if(forCancel)
      {
        window.cancelAnimationFrame(forCancel);
        forCancel = null;
      }

      if(!isNaN(hover_o))
      {
        forCancel = window.requestAnimationFrame(() => {
          present(o, section, undefined, true);
        });
      }
    }

    proseEl.onmousemove = (e) =>
    {
      if(forClick)
        return;

      if(forCancel)
      {
        window.cancelAnimationFrame(forCancel);
        forCancel = null;
      }

      let i = parseInt(e.srcElement.dataset.i);
      if(isNaN(i) && e.srcElement.attributes.pref)
      {
        i = parseInt(e.srcElement.parentElement.dataset.i);
      }
      if(!isNaN(i))
      {
        forCancel = window.requestAnimationFrame(() => {
          present(o, section, i, true);
        });
      }
    }

    proseEl.onclick = (e) =>
    {
      forClick = true;
      if(forCancel)
      {
        window.cancelAnimationFrame(forCancel);
        forCancel = null;
      }

      let i = parseInt(e.srcElement.dataset.i);
      if(!isNaN(i))
      {
        window.requestAnimationFrame( () => {
          forClick = false;
          present(i, section);
        });
      }
    }
  }

  return {present, proxy};
}

function elements() {
  const jss = create().setup(preset());
  const sheet = jss.createStyleSheet(style(colors), {link: true});
  sheet.attach();

  const cs = sheet.classes;

  const made = html(colors, cs);

  let section_indices = {};
  let pr;

  const rg = makeRG();
  window.books = window.books_(rg);

  window.onload = () => {

    const el = document.querySelector('#container');
    el.className = cs.container;
    el.innerHTML = made.cover + made.section;

    const svg = document.querySelector('#figure');
    pr = makePR(rg, svg, cs);

    presentForLocation();
  }

  function canPresentSection(i_book, id) {
    let sections = books[i_book];
    if(!sections) return false;

    if(!section_indices[i_book])
    {
      let n = {}
      sections.forEach((s, i) => n[s.id] = i);
      section_indices[i_book] = n;
    }

    let i_section = section_indices[i_book][id];
    if(typeof i_section === 'undefined')
    {
      return false;
    }
    else
    {
      return true;
    }
  }

  function presentSection(i_book, id) {
    let sections = books[i_book];

    let i_section = section_indices[i_book][id];

    document.querySelector('#container').className = 'section';

    let el = document.querySelector('#bookTitle');
    el.innerText = 'Book ' + (i_book) + ' - ' + books.descs[i_book-1];

    i_section = Math.min(sections.length-1, i_section);
    pr.present(null, sections[i_section]);

    function keyHandler(e)
    {
      if(e.key == "j" || e.keyCode == 39)
      {
        pr.proxy.moveon();
      }
      else if(e.key == "k" || e.keyCode == 37)
      {
        pr.proxy.moveback();
      }
      else if(e.key == "z")
      {
        i_section = (i_section-1 + sections.length) % sections.length;
        openSection(i_book, sections[i_section].id);
      }
      else if(e.key == "x")
      {
        i_section = (i_section+1) % sections.length;
        openSection(i_book, sections[i_section].id);
      }
      else if(e.key == "h")
      {
        let s = document.querySelector('#auxColumn .given');
        if(s)
        {
          if(s.style.display != "none")
            s.style.display = "none";
          else
            s.style.display = null;
        }
      }
    }

    document.onkeydown = keyHandler;

    document.querySelector('#move-on').ontouchend = (e) =>
    {
      e.preventDefault();
      pr.proxy.moveon();
    }

    document.querySelector('#move-on').onmousedown = (e) =>
    {
      pr.proxy.moveon();
    }

    document.querySelector('#move-back').ontouchend = (e) =>
    {
      e.preventDefault();
      pr.proxy.moveback();
    }

    document.querySelector('#move-back').onmousedown = (e) =>
    {
      pr.proxy.moveback();
    }

    document.querySelector('#prev-section').ontouchend = (e) =>
    {
      e.preventDefault();
      i_section = (i_section-1+sections.length) % sections.length;
      openSection(i_book, sections[i_section].id);
    }

    document.querySelector('#next-section').ontouchend = (e) =>
    {
      e.preventDefault();
      i_section = (i_section+1) % sections.length;
      openSection(i_book, sections[i_section].id);
    }

    document.querySelector('#prev-section').onmousedown = (e) =>
    {
      i_section = (i_section-1+sections.length) % sections.length;
      openSection(i_book, sections[i_section].id);
    }

    document.querySelector('#next-section').onmousedown = (e) =>
    {
      i_section = (i_section+1) % sections.length;
      openSection(i_book, sections[i_section].id);
    }
  }

  function presentCover() {
    document.querySelector('#container').className = 'cover';
    document.onkeydown = undefined;
  }

  let presentForLocation = () => {
    let m, re = /elements\/([^\/]+)/;
    if(m = location.pathname.match(re))
    {
      let id = m[1];
      let [i_book, _] = id.split('.');
      if(!isNaN(Number(i_book)) && canPresentSection(i_book, id))
      {
        presentSection(i_book, id);
      }
      else
      {
        presentCover();
      }
    }
    else
    {
      history.replaceState(null, '', '/elements/');
      presentCover();
    }
  }

  window.onpopstate = (e) => {
    presentForLocation();
  }

  function openSection(i_book, id) {
    if(canPresentSection(i_book, id))
    {
      history.pushState(null, '', id);
      presentSection(i_book, id);
    }
    else
    {
      presentCover();
    }
  }

  function openCover()
  {
    history.pushState(null, '', '/elements/');
    presentCover();
  }

  document.onclick = (e) => {
    let pref = e.srcElement.attributes.pref;
    if(!pref && e.srcElement.parentElement)
    {
      pref = e.srcElement.parentElement.attributes.pref;
    }

    if(pref)
    {
      if(pref.value == 'cover')
      {
        openCover();
      }
      else
      {
        let [i_book, _] = pref.value.split('.');
        if(isNaN(i_book))
        {
          console.error("unknown pref: ", pref.value);
        }
        else
        {
          openSection(i_book, pref.value)
        }
      }
    }
  }

  function alignFigure(scroll_position) {
    let t, d;
    if(scroll_position > 0)
    {
      if(scroll_position > 75)
        t = 0;
      else
        t = 76;
    }
    else
    {
      t = 76 - scroll_position;
    }
    let h = Math.min(512, window.innerHeight - Math.min(76, t));

    let rule = sheet.getRule('auxColumn');
    rule.prop('top', t);
    rule.prop('width', h);
    rule.prop('height', h);
  }

  let last_known_scroll_position = 0;
  let ticking = false;

  function queueAlign() {
    last_known_scroll_position = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(function() {
        alignFigure(last_known_scroll_position);
        ticking = false;
      });

      ticking = true;
    }
  }
  window.addEventListener('scroll', queueAlign);

  window.onresize = queueAlign;
};

elements();
