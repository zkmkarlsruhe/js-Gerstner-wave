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
  constructor( scaling, direction, speed, height, lambda ) {
    this.version = 2;
    console.groupCollapsed( 'Gernster Wave. Version:', this.version );
    console.debug( 'Parameters:', speed, height, lambda, '(Speed, Height, lambda)' );
    console.groupEnd();
    this.height = height;
    this.speed = speed;
    this.lambda = lambda;
    this.direction = direction;
    this.scaling = scaling;
    this.t = 0;
    return;
  }

  set direction( vect ) {
    if( vect instanceof THREE.Vector3 ){
      this._direction = vect;
    } else {
      throw new Error( 'You must provide a THREE.Vector3 for direction.' );
    }
  }

  get direction() {
    return this._direction;
  }

  set scaling( vect ) {
    if( vect instanceof THREE.Vector3 ){
      this._scaling = vect;
    } else {
      throw new Error( 'You must provide a THREE.Vector3 for scaling.' );
    }
  }

  get scaling() {
    return this._scaling;
  }

  update( millis = 0 ) {
    if( millis == 0 ) millis = Date.now();
    this.t = this.speed * 0.001 * millis % ( 2 * Math.PI );
    return;
  }

  _xOffset( pos ) {
    return 2 * Math.PI * ( pos.x / this.scaling.x ) * this.direction.x;
  }

  _zOffset( pos ) {
    return 2 * Math.PI * ( pos.z / this.scaling.z ) * this.direction.z;
  }

  _pOffset( pos ) {
    return this.lambda * ( this._xOffset( pos ) + this._zOffset( pos ) );
  }

  getParticle( particle ) {
    if( particle instanceof THREE.Vector3 ) {
      var x = this.direction.x * Math.cos( this._pOffset( particle ) - this.t );
      var z = this.direction.z * Math.cos( this._pOffset( particle ) - this.t );
      var y = Math.sin( this._pOffset( particle ) - this.t );
      return new THREE.Vector3( x, y, z ).multiplyScalar( this.height );
    } else {
      throw new Error( 'You must provide a THREE.Vector3 as particle position.' );
    }
  }
}

class MultipleWaves {
  constructor( scaling ) {
    this.version = 2;
    this.scaling = scaling;
    console.groupCollapsed( 'Multiple Waves. Version', this.version );
    console.groupEnd();
    this.waves = [];
  }

  set scaling( vect ) {
    if( vect instanceof THREE.Vector3 ){
      this._scaling = vect;
    } else {
      throw new Error( 'You must provide a THREE.Vector3 for scaling.' );
    }
  }

  get scaling() {
    return this._scaling;
  }

  example() {
    this.addWave( -90, 0.2, 2, 2 );
    this.addWave( 10,  0.2, 2, 1 );
    this.addWave( 120, 0.3, 1, 4 );
  }

  addWave( direction=45, height=0.5, speed=2, lambda=2 ) {
    var dir = direction;
    if( !(direction instanceof THREE.Vector3 ) ) {
      dir = new THREE.Vector3( 1, 0, 0 );
      dir.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), direction * THREE.Math.DEG2RAD );
    }
    this.waves.push( new Wave( this.scaling, dir, speed, height, lambda ) );
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
