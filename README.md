# Connectors

Prototype code for node-edge graph connectors in SVG.

Initial implementation of Doug Schepers' proposed [SVG Connectors](https://dev.w3.org/SVG/modules/connector/SVGConnector.html) specification from 2011.

This repo is partly for posterity, but hopefully a jumping-off point for new progress on SVG Connectors.

## Examples

- [k3-3.svg](./prototypes/k3-3.svg): the three-utilities problem, a classical mathematical puzzle (also known as the water, gas, and electricity problem) which asks for non-crossing connections to be drawn between three houses and three utility companies in the plane, an impossible task
- [k5-complete.svg](./prototypes/k5-complete.svg): a complete K5 graph, a simple directed graph with 5 nodes in which every pair of distinct nodes is connected by a unique edge
- [k5-2.svg](./prototypes/k5-2.svg): a simple undirected graph with connectors that can be arranged not to intersect
- [flowchart](./prototypes/flowchart.svg): multiple shape types, multiple connectors and ports
- [connector-ports](./prototypes/connector-ports.svg): multiple shape types, in-bound and out-bound ports

## Incomplete specifications

- [SVG Connector specification](./specs/SVGConnector.html)
- [SVG Connector Requirements](./specs/SVGConnectorReqs.html)
- [SVG Connector Primer](./specs/SVGConnectorPrimer.html)
