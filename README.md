<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/zkmkarlsruhe/zkm-open-source/main/assets/zkm-logo-light.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/zkmkarlsruhe/zkm-open-source/main/assets/zkm-logo.svg">
    <img alt="ZKM" src="https://raw.githubusercontent.com/zkmkarlsruhe/zkm-open-source/main/assets/zkm-logo.svg" width="120">
  </picture>
</p>

# Gerstner Wave Simulation

[![ZKM](https://img.shields.io/badge/ZKM-Karlsruhe-blue)](https://zkm.de)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Part of [ZKM Open Source](https://github.com/zkmkarlsruhe)

---

![Preview of the waves](media/preview.png)

## API

### Wave

```wave = new Wave( scaling, direction, speed, height, lambda )```
* scaling : THREE.Vector3. This defines the size of the field to emulate the wave in.
* direction : THREE.Vector3. Sets the direction of propgation of the wave.
* speed : float. Propagation speed.
* height : float. Height of the wave.
* lambda : float. Wavelenght relative to the scaling.

#### Properties

* ```.scaling : THREE.Vector3``` defines the size of the field.
* ```.direction : THREE.Vector3```. Propgation direction of the wave.

#### Methods

* ```.getParticle( particle )```
* ```.update()```

### MultipleWaves

```sea = new MultipleWaves( scaling )```
* scaling : THREE.Vector3. This defines the size of the field to emulate the wave in.

#### Properties

* ```.scaling : THREE.Vector3``` defines the size of the field.

#### Methods

* ```.example()```
* ```.addWave( direction, height, speed, lambda )```
* ```.getParticle( particle )```
* ```.update()```

## Related

* [Trochoidal wave](https://en.wikipedia.org/wiki/Trochoidal_wave) on Wikipedia.org
