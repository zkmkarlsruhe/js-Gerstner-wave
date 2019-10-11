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

var stats, controls;
var tween = new TWEEN.Tween();

var onRenderFcts = [];
var initFcts = [];
var loaderFcts = [];

var stats = true;

const TwoPi = Math.PI * 2;

// class WireframeCube {
//
//   constructor(size=25) {
//     this.geometry = new THREE.BoxBufferGeometry( size, size, size );
//     this.wireframe = new THREE.EdgesGeometry( this.geometry );
//     this.material = new THREE.LineBasicMaterial( { color: 0xffffff,	linewidth: 1 } );
//     this.mesh = new THREE.LineSegments( this.wireframe, this.material );
//   }
//
//   animate(offset) {
//     this.rotationOffset = offset // new THREE.Vector3(0,0,0);
//     this.rotation = new THREE.Vector3(0,0,0);
//     this.rotation.add(this.rotationOffset);
//     this.rotationTarget = new THREE.Vector3(0,TwoPi,0);
//     this.rotationTarget.add(this.rotationOffset);
//     this.mesh.userData.tween = new TWEEN.Tween(this.rotation).to(this.rotationTarget, 10000);
//
//     function onUpdate() {
//       this.mesh.rotation.setFromVector3(this.rotation);
//     }
//
//     this.mesh.userData.tween.onUpdate(onUpdate.bind(this));
//     this.mesh.userData.tween.repeat(Infinity);
//     this.mesh.userData.tween.start()
//
//   }
// }

function polarArray( r, count ) {

  let output = [];
  for( var i = 0; i < count; i++ ) {
    let position = new THREE.Vector3();
    let offset = TwoPi * i / count;
    position.set( r * Math.cos( offset ), r * Math.sin( offset ), 0 );
    output.push( position );
  }
  return output;

}

function XYArray( params, format='Vector3', center=true ) {
  // params = {xc, yc, zc, xs, ys, zs}
  let xpos = 0;
  let ypos = 0;
  let zpos = 0;
  let xoffset = 0;
  let yoffset = 0;
  let zoffset = 0;
  if( center ) {
    xoffset = params.xs * ( params.xc - 1 ) / 2;
    yoffset = params.ys * ( params.yc - 1 ) / 2;
    zoffset = params.zs * ( params.zc - 1 ) / 2;
  }
  let output = [];
  for( var z = 0; z < params.zc; z++ ) {
    for( var y = 0; y < params.yc; y++ ) {
      for( var x = 0; x < params.xc; x++ ) {
        switch ( format ) {
          case 'Vector3':
            output.push( new THREE.Vector3( xpos - xoffset, ypos - yoffset, zpos - zoffset ) );
            break;
          default:
            output.push( { x: xpos - xoffset, y: ypos - yoffset, z: zpos - zoffset } );
        }
        xpos += params.xs;
      }
      ypos += params.ys;
      xpos = 0;
    }
    zpos += params.zs;
    ypos = 0;
  }
  return output;
}

class Wave {

  constructor( x, z, dir, speed=1, height=1, waveLength=1 ) {

    const this.version = 1;
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
    this.waves = [
      new Wave( x, y, -90, 2, 0.2, 2 ),
      new Wave( x, y, 10, 2, 0.2, 1 ),
      new Wave( x, y, 120, 1, 0.2, 4 ),
    ];

  }

  getParticle( particle ) {

    var position = new THREE.Vector3();
    for( var wave of this.waves ) position.add( wave.getParticle( particle ) );
    return position;

  }

  update() {

    // Call this function within the animation loop.
    var now = Date.now();
    for( var wave of this.waves ) wave.update( now );

  }

}

class PointGrid {
  
  constructor( x, z ) {

    this.xres = 100;
    this.zres = 100;
    this.params = {
      xc: this.xres,
      yc: 1,
      zc: this.zres,
      xs: x / this.xres,
      ys: 1,
      zs: z / this.zres
    };
    this.grid = XYArray( this.params );
    this.fill();

  }

  fill() {

    this.group = new THREE.Group();
    for( let position of this.grid ) {
      let cube = new THREE.Mesh(
        new THREE.BoxGeometry( 5, 5, 5 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff } )
      );
      cube.position.copy(position);
      cube.userData.gridPosition = position.clone();
      this.group.add( cube );
    }
    return;

  }

}

function initWorld() {
  var i = 0;
  let x = 2500;
  let z = 2500;
  wave = new MultipleWaves( x, z );
  ptGrid = new PointGrid( x, z );
  scene.add(ptGrid.group);

  onRenderFcts.push( function() {
    wave.update();
    for(var particle of ptGrid.group.children) {
      particle.position.copy( particle.userData.gridPosition );
      particle.position.add( wave.getParticle(particle.userData.gridPosition ).multiplyScalar( 100 ) );
    }
  });
  console.debug( 'OK: World Initialized.' );
  return;
}

///

class GUIControls {

  constructor() {

    this.gui = new dat.GUI();

  }

  textFolder( target ) {

    this.textCtrl = this.gui.addFolder( 'Text' );
    this.textCtrl.add( target, 'size' ).name( 'Size' );
    this.textCtrl.add( target, 'height' ).name( 'Thickness' );
    this.textCtrl.addColor( target, 'color' ).name( 'Color' );

  }

  cameraFolder( camera ) {

    this.cameraCtrl = this.gui.addFolder( 'Camera' );
    this.cameraCtrl.add( camera.position, 'y' ).name( 'Height' );
    this.cameraCtrl.add( camera.rotation, 'x', - Math.PI / 4, 0 ).name( 'Pitch' );

  }

  waveFolder ( waves ) {

    this.waveCtrl = this.gui.addFolder ( 'Waves' );
    this.waveCtrl.add( waves, 'speed', 0, 20 ).name( 'Speed' );
    this.waveCtrl.add( waves, 'height', 0, 100 ).name( 'Height' );
    this.waveCtrl.add( waves, 'waveLength', 10, 50).name( 'Width' );
    this.waveCtrl.open();

  }

}

function initRenderer() {

	renderer = new THREE.WebGLRenderer({
      antialias: true,       // Performance on older mobile devices.
      precision: 'mediump',   // Performance on older mobile devices.
      alpha: true,            // Display webcam image in background.
      // powerPreference: "low-power", // Mobile application.
      logarithmicDepthBuffer: true
  });
  renderer.domElement.id = 'renderer';
	renderer.setClearColor( 0x000000 );
  renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
  console.debug( 'OK: Initialized renderer.' );

}

initFcts.push( initRenderer );

function initStats() {

  stats = new Stats();
  stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );
  console.debug( 'OK: Initialized statistics.' );

}

if( stats ) {
  initFcts.push( initStats );
}

function initCamera() {

  // camera = new THREE.OrthographicCamera(
  //   - window.innerWidth / 2,  // Left
  //   + window.innerWidth / 2,  // Right
  //   + window.innerHeight / 2, // Top
  //   - window.innerHeight / 2, // Bottom
  //   1,                        // Near
  //   2000                      // Far
  // );
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    5000);
	camera.position.set( 0, 2000, 3000 );
  camera.lookAt( new THREE.Vector3() );
  console.debug( 'OK: Initialized camera.' );

}

initFcts.push( initCamera );

function initScene() {

  scene = new THREE.Scene();
  scene.add( new THREE.AmbientLight( 0xffffff ));
  console.log( 'OK: Initialized scene.' );

}

initFcts.push( initScene );

function initControls() {

  ctrlPanel = new GUIControls();

  document.addEventListener( 'keydown', ( event ) => {

    const keyName = event.key;
    if (keyName === 'Control' ) return;
    if ( event.ctrlKey ) {
      // Even though event.key is not 'Control' (i.e. 'a' is pressed),
      // event.ctrlKey may be true if Ctrl key is pressed at the time.
      console.debug(`Combination of ctrlKey + ${keyName}`);
    } else {
      console.debug(`Key pressed ${keyName}`);
      switch( keyName ) {

        case "h":
          ctrlPanel.gui.domElement.hidden != ctrlPanel.gui.domElement.hidden;
          stats.dom.hidden = !stats.dom.hidden
          break;

        default:
          break;

      }
    }

  }, false);

} // End of initControls()

initFcts.push( initControls );

initFcts.push( initWorld );

function render() {

  renderer.render( scene, camera );
  TWEEN.update();

}

onRenderFcts.push( render );

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener( 'resize', onWindowResize, false );


// ----------------------------------------------------------------------
// Helper functions

function getRandomInt( min, max ) { // Maximum exclusive and minimum inclusive

    min = Math.ceil( min );
    max = Math.floor( max );
    return Math.floor( Math.random() * ( max - min ) ) + min;

}


function getMaxOfArray( numArray ) {	// Max value inside an array

	 return Math.max.apply( null, numArray );

}

function getMinOfArray( numArray ) {	// Min value inside an array

	 return Math.min.apply( null, numArray );

}

function init() {

  console.group( 'Intitialize all the things!' );
  initFcts.forEach( function( initFct ) {
    initFct();
  });
  console.groupEnd();

}

function animate() {

  if ( stats ) {
    stats.begin();
  }
  onRenderFcts.forEach( function( onRenderFct ) {
    onRenderFct();
  });
  if ( stats ) {
    stats.end();
  }
  requestAnimationFrame( animate ); // Animation frame

}
