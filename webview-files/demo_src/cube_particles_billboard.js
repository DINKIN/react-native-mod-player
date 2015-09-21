window.scenes = window.scenes || {};

window.scenes.cube_particles_billboards = {
    start : function() {

        var container, stats;
        var camera, scene, renderer, particles, geometry, material, i, h, color, sprite, size;
        var mouseX = 0, mouseY = 0;

        var windowHalfX = window.innerWidth / 2;
        var windowHalfY = window.innerHeight / 2;

        init();
        animate();

        function init() {

            container = document.createElement( 'div' );
            document.body.appendChild( container );

            camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 2, 2000 );
            camera.position.z = 500;

            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2( 0x000000, 0.001 );

            geometry = new THREE.Geometry();

            for ( i = 0; i < 100000; i ++ ) {
                var vertex = new THREE.Vector3();
                
                vertex.x = 2000 * Math.random() - 1000;
                vertex.y = 2000 * Math.random() - 1000;
                vertex.z = 2000 * Math.random() - 1000;

                geometry.vertices.push( vertex );
            }

            material = new THREE.PointCloudMaterial({ 
                size: 3, 
                sizeAttenuation: true, 
                alphaTest: 0.5, 
                transparent: true 
            });

            material.color.setHSL(1.0, 1, 1);

            particles = new THREE.PointCloud(geometry, material );
            
            scene.add(particles);

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            container.appendChild( renderer.domElement );

            window.addEventListener( 'resize', onWindowResize, false );

        }

        function onWindowResize() {
            windowHalfX = window.innerWidth / 2;
            windowHalfY = window.innerHeight / 2;

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );
        }


        function animate() {
            requestAnimationFrame( animate );
            render();
        }


        var tick = 0,
            minX,
            cameraX,
            maxX,
            dir;

        camera.position.x = -3000;
        renderer.render( scene, camera );

        function render() {
            tick ++
            renderer.render( scene, camera );

            var time = Date.now() * 0.00005;

            // console.log(cameraX)
            if (cameraX == 0) {
                var x = camera.position.x,
                    y = camera.position.y,
                    z = camera.position.z,
                    
                    rotSpeed = .02;

                 camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
                 camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);
                 // camera.position.y = z * Math.cos(rotSpeed) - y * Math.sin(rotSpeed);

            }
            else {
                camera.position.x += ( (cameraX == undefined ? 0 : cameraX) - camera.position.x ) * 0.05;
                camera.position.y += ( camera.position.y ) * 0.05;     
            }
            

            window.camera = camera;

            camera.lookAt(scene.position);

            if (cameraX == undefined) {
                minX     = -3000;
                cameraX  = minX;
                maxX     = 3000;
                dir      = 1;
            }
            else if (cameraX != 0) {
                if (cameraX <= minX) {
                    dir = 1;
                }
                else if (cameraX >= maxX) {
                    dir = -1;
                }

                if (dir == 1) {
                    cameraX += 10;
                }
                // else {
                //     cameraX -= 20;
                // }


            }

          


        }

    },

    end : function(callback) {
            // Todo: fade out and remove element


    }
}


window.scenes.cube_particles_billboards.start();