update public.projects
set
  description = 'A live Baltic vessel explorer with Digitraffic AIS positions, 30-minute constant-course projections, and a public API. Hosted on Cloudflare Workers, with an optional MQTT/PostgreSQL collection pipeline.',
  image_url = '/images/projects/navicast-live-2026-10.jpg',
  demo_url = 'https://navicast.imadlab.com/',
  updated_at = now(),
  full_description = $navicast$
I built NaviCast as a maritime data engineering project after a challenge from my professor, Tommi Tuomola. It now has a publicly deployed Baltic vessel map, alongside the original Python collection pipeline.

## Live vessel explorer

The [live map](https://navicast.imadlab.com/) reads current AIS positions from Fintraffic Digitraffic. It shows vessel positions, observation freshness, and 30-minute constant-course projections. Filters separate moving, stationary, and projected vessels; individual vessels expose position and motion details. The interface also supports dark mode and CSV/JSON exports.

The screenshot above was captured from the hosted application in October 2026. Vessel counts and positions change with the feed.

## Hosted architecture

A Cloudflare Worker serves the Leaflet dashboard and adapts Digitraffic's public AIS REST snapshots to the vessel API. Snapshots are cached for 30 seconds per Cloudflare location. Source timestamps are preserved so the interface can distinguish fresh observations from stale ones.

The public deployment uses no historical database or trained model. Invalid or old observations are excluded, and upstream failures surface as service errors rather than being replaced with synthetic data.

## Collection pipeline and local demo

The optional Python stack collects Digitraffic MQTT messages into PostgreSQL, retaining normalized positions and raw JSONB. A scheduled service calculates dead-reckoning projections, and FastAPI exposes vessel details, exports, metadata, and health checks.

The local demo runs without a database or AIS connection. It serves four explicitly synthetic Baltic vessel records through the same interface. The hosted map uses live observations.

## Projection method

Projections assume constant speed and course for 30 minutes from each AIS observation. They do not account for weather, routing, or manoeuvres, and are intended for exploration rather than navigation.

The repository retains earlier model experiments as historical research artifacts. Those metrics do not describe the current deployed application.

## Stack and source

- Hosted map: Cloudflare Workers, JavaScript, Leaflet, Digitraffic REST API
- Optional collection pipeline: Python, FastAPI, PostgreSQL, Paho MQTT
- Local demo: synthetic vessel data, Python or Docker Compose

[Source code](https://github.com/imaddde867/NaviCast) · [Live API documentation](https://navicast.imadlab.com/docs)
$navicast$
where title = 'NaviCast: Real-Time Maritime Intelligence Pipeline';
