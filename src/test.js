import React from 'react';
import reactTestRender from 'react-test-renderer';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import microdata from '.';

const enzymeRender = renderer => element =>
  microdata(toJSON(renderer(element)));

const renderers = [
  ['rtr', element => microdata(reactTestRender.create(element).toJSON())],
  ['enz.shallow', enzymeRender(shallow)],
  ['enz.mount', enzymeRender(mount)],
];

renderers.forEach(([title, render]) => {
  describe(`${title} compatibility`, () => {
    test('singular item', () =>
      expect(
        render(
          <div itemScope>
            <div itemProp="a">1</div>
            <div itemProp="b">2</div>
          </div>,
        ),
      ).toEqual({
        a: '1',
        b: '2',
      }));

    test('array of items with one item', () =>
      expect(
        render(
          <div>
            <div itemScope>
              <div itemProp="a">1</div>
              <div itemProp="b">2</div>
            </div>
          </div>,
        ),
      ).toEqual([
        {
          a: '1',
          b: '2',
        },
      ]));

    test('array of items with two items', () =>
      expect(
        render(
          <div>
            <div itemScope>
              <div itemProp="a">1</div>
              <div itemProp="b">2</div>
            </div>
            <div itemScope>
              <div itemProp="c">3</div>
              <div itemProp="d">4</div>
            </div>
          </div>,
        ),
      ).toEqual([
        {
          a: '1',
          b: '2',
        },
        {
          c: '3',
          d: '4',
        },
      ]));

    test('deep nested prop', () =>
      expect(
        render(
          <div>
            <div>
              <div itemScope>
                <div>
                  <div itemProp="a">1</div>
                </div>
                <div itemProp="b">2</div>
              </div>
            </div>
            <div itemScope>
              <div itemProp="c">3</div>
              <div itemProp="d">4</div>
            </div>
          </div>,
        ),
      ).toEqual([
        {
          a: '1',
          b: '2',
        },
        {
          c: '3',
          d: '4',
        },
      ]));

    test('realworld microdata type', () =>
      expect(
        render(
          <div itemScope itemType="http://schema.org/SoftwareApplication">
            <span itemProp="name">Angry Birds</span> -

            REQUIRES <span itemProp="operatingSystem">ANDROID</span><br />
            <link
              itemProp="applicationCategory"
              href="http://schema.org/GameApplication"
            />

            <div
              itemProp="aggregateRating"
              itemScope
              itemType="http://schema.org/AggregateRating"
            >
              RATING:
              <span itemProp="ratingValue">4.6</span> (
              <span itemProp="ratingCount">8864</span> ratings )
            </div>

            <div itemProp="offers" itemScope itemType="http://schema.org/Offer">
              Price: $<span itemProp="price">1.00</span>
              <meta itemProp="priceCurrency" content="USD" />
            </div>
          </div>,
        ),
      ).toEqual({
        aggregateRating: {
          ratingCount: '8864',
          ratingValue: '4.6',
        },
        applicationCategory: 'http://schema.org/GameApplication',
        name: 'Angry Birds',
        offers: {
          price: '1.00',
          priceCurrency: 'USD',
        },
        operatingSystem: 'ANDROID',
      }));

    test('complex nested items', () =>
      expect(
        render(
          <div>
            <div itemScope>
              <div>
                <div itemProp="a">1</div>
              </div>
              <div itemProp="b">2</div>
            </div><div itemScope>
              <div itemProp="c">
                <div itemScope>
                  <div itemProp="e">5</div>
                  <div itemProp="f">6</div>
                </div>
                <div itemScope>
                  <div itemProp="g">7</div>
                  <div itemProp="h">8</div>
                </div>
              </div>
              <div itemProp="d">4</div>
            </div>
          </div>,
        ),
      ).toEqual([
        {
          a: '1',
          b: '2',
        },
        {
          c: [
            {
              e: '5',
              f: '6',
            },
            {
              g: '7',
              h: '8',
            },
          ],
          d: '4',
        },
      ]));

    test('value concatenation', () =>
      expect(
        render(
          <div itemScope>
            <div itemProp="x">
              1
              <span>sup</span>
              2
            </div>
          </div>,
        ),
      ).toEqual({
        x: '1 sup 2',
      }));

    test('no microdata', () => expect(render(<div />)).toEqual([]));

    test('deeply nested value', () =>
      expect(
        render(
          <div itemScope><div itemProp="a"><span><b>Data</b></span></div></div>,
        ),
      ).toEqual({
        a: 'Data',
      }));

    if (!/^enz/.test(title)) {
      test('lowcase props', () =>
        expect(render(<div itemscope><div itemprop="a" /></div>)).toEqual({
          a: '',
        }));
    }

    test('iframe', () =>
      expect(
        render(<div itemScope><iframe itemProp="frame" src="test" /></div>),
      ).toEqual({
        frame: 'test',
      }));
  });
});

test('string as an argument', () => expect(microdata('string')).toEqual([]));

test('enzyme shallow and mount rendering', () => {
  const Component = () => <div>mounted</div>;

  const el = (
    <div itemScope><Component itemProp="component">not mounted</Component></div>
  );

  expect(enzymeRender(shallow)(el)).toEqual({component: 'not mounted'});
  expect(enzymeRender(mount)(el)).toEqual({component: 'mounted'});
});

const Table = props => <table {...props} />;
const TableBody = props => <tbody {...props} />;
const TableRow = props => <tr {...props} />;
const TableColumn = props => <td {...props} />;

test('components that pass props down to the primitives', () => {
  expect(
    enzymeRender(mount)(
      <Table>
        <TableBody>
          <TableRow itemScope>
            <TableColumn itemProp="a">1</TableColumn>
            <TableColumn itemProp="b">2</TableColumn>
            <TableColumn itemProp="c">3</TableColumn>
            <TableColumn itemProp="d">4</TableColumn>
          </TableRow>
          <TableRow itemScope>
            <TableColumn itemProp="e">5</TableColumn>
            <TableColumn itemProp="f">6</TableColumn>
            <TableColumn itemProp="g">7</TableColumn>
            <TableColumn itemProp="h">8</TableColumn>
          </TableRow>
        </TableBody>
      </Table>,
    ),
  ).toEqual([
    {a: '1', b: '2', c: '3', d: '4'},
    {e: '5', f: '6', g: '7', h: '8'},
  ]);
});

test('props are undefined', () => {
  const noProps = {type: 'div', props: undefined, children: []};
  expect(microdata(noProps)).toEqual([]);
  expect(
    microdata({type: 'div', props: {itemScope: true}, children: [noProps]}),
  ).toEqual({});
});
