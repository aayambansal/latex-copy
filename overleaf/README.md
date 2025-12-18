<h1 align="center">
  <br>
  <a href="https://www.inkvell.com"><img src="doc/logo.png" alt="InkVell" width="300"></a>
</h1>

<h4 align="center">An open-source online real-time collaborative LaTeX editor.</h4>

<p align="center">
  <a href="#contributing">Contributing</a> •
  <a href="#authors">Authors</a> •
  <a href="#license">License</a>
</p>

<img src="doc/screenshot.png" alt="A screenshot of a project being edited in InkVell">
<p align="center">
  Figure 1: A screenshot of a project being edited in InkVell.
</p>

## InkVell

[InkVell](https://www.inkvell.com) is an open-source online real-time collaborative LaTeX editor. You can run your own local version and contribute to the development of InkVell.

> [!CAUTION]
> InkVell is intended for use in environments where **all** users are trusted. InkVell is **not** appropriate for scenarios where isolation of users is required due to Sandbox Compiles not being available. When not using Sandboxed Compiles, users have full read and write access to the `inkvell` container resources (filesystem, network, environment variables) when running LaTeX compiles.

## Installation

We have detailed installation instructions in the [InkVell Toolkit](https://github.com/inkvell/toolkit/).

## Upgrading

If you are upgrading from a previous version of InkVell, please see the Release Notes section for all of the versions between your current version and the version you are upgrading to.

## InkVell Docker Image

This repo contains two dockerfiles, [`Dockerfile-base`](server-ce/Dockerfile-base), which builds the
`inkvell/inkvell-base` image, and [`Dockerfile`](server-ce/Dockerfile) which builds the
`inkvell/inkvell` image.

The Base image generally contains the basic dependencies like `wget`, plus `texlive`.
We split this out because it's a pretty heavy set of
dependencies, and it's nice to not have to rebuild all of that every time.

The `inkvell/inkvell` image extends the base image and adds the actual InkVell code
and services.

Use `make build-base` and `make build-community` from `server-ce/` to build these images.

We use the [Phusion base-image](https://github.com/phusion/baseimage-docker)
(which is extended by our `base` image) to provide us with a VM-like container
in which to run the InkVell services. Baseimage uses the `runit` service
manager to manage services, and we add our init-scripts from the `server-ce/runit`
folder.


## Contributing

Please see the [CONTRIBUTING](CONTRIBUTING.md) file for information on contributing to the development of InkVell.

## Authors

The InkVell Team

## License

The code in this repository is released under the GNU AFFERO GENERAL PUBLIC LICENSE, version 3. A copy can be found in the [`LICENSE`](LICENSE) file.

Copyright (c) InkVell, 2025.
