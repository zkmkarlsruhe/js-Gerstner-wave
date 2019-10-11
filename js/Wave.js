// Copyright 2019 Christian Lölkes
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

class Wave {

  constructor( x, z, dir, speed=1, height=1, waveLength=1 ) {

    this.version = 1;
    console.groupCollapsed( 'Gernster Wave. Version:', this.version );
    console.debug( 'Dimesions:', x, z, '(x, z)' );
    console.debug( 'Direction:', dir + '°' )
    console.debug( 'Parameters:', speed, height, waveLength, '(Speed, Height, Wavelength)' );
    console.groupEnd();

    // x : dimension in X-axis
    // z : dimension in Z-axis
    // dir: direction in degrees, rotation around Y-axis
    this.xSize = x;
    this.zSize = z;
    this.height = height;
    this.speed = speed;
    this.waveLength = waveLength;
    this.direction = new THREE.Vector3( 1, 0, 0 );
    this.direction.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), THREE.Math.DEG2RAD * dir );
    this.t = 0;
    return;

  }

  update( millis = 0 ) {

    if( millis == 0 ) millis = Date.now();
    this.t = this.speed * 0.001 * millis % ( 2 * Math.PI );
    return;

  }

  xOffset( particle ) {

    return 2 * Math.PI * ( particle.x / this.xSize ) * this.direction.x;

  }

  zOffset( particle ) {

    return 2 * Math.PI * ( particle.z / this.zSize ) * this.direction.z;

  }

  pOffset( particle ) {

    return this.waveLength * ( this.xOffset( particle ) + this.zOffset( particle ) );

  }

  getParticle( particle ) {

    var x = this.direction.x * Math.cos( ( - this.t + this.pOffset( particle ) ) );
    var z = this.direction.z * Math.cos( ( - this.t + this.pOffset( particle ) ) );
    var y = Math.sin( - this.t + this.pOffset( particle ) );
    return new THREE.Vector3( x, y, z ).multiplyScalar( this.height );

  }

}

class MultipleWaves {

  constructor( x, y ) {

    this.version = 1;
    console.groupCollapsed( 'Multiple Waves. Version', this.version );
    console.groupEnd();
    this.waves = [
      new Wave( x, y, -90, 2, 0.2, 2 ),
      new Wave( x, y,  10, 2, 0.2, 1 ),
      new Wave( x, y, 120, 1, 0.2, 4 ),
    ];

  }

  getParticle( particle ) {

    var position = new THREE.Vector3();
    for( var wave of this.waves ) position.add( wave.getParticle( particle ) );
    return position;

  }

  update() { // Call this within the animation loop.

    var now = Date.now();
    for( var wave of this.waves ) wave.update( now );

  }

}
