# WebGLPruebas

My WebGL testing project that includes:
  - Custom Engine with:
    - Scenes with lifeclycle and SceneObject.
    - Components as: 
      - Lights (flat and cube shadows).
      - Materials with own API and chainable.
      - Renderer (auto normal generation and obj loading ready).
      - Also you can create your own component and add it to lifecycle.
    - Camera:
      - Lot of camera movement with directions and rotations.
      - View and projection matrix management.
      - Skybox management.
      - Automatic up vector calculation.
    - Shader API in JSON with default uniform values.
  - Custom materials:
    - Diffuse, Specular & Shadows material with textures.
    - CellShading material.
    - Mirror material.
    - Skybox material.
    - Post processing material:
      - With lots of shaders (as sobel, invert, antianalising, etc).
  - Controls for camera and mouse.
  - Utilities including lots of vector operations (add, sub, dot, normalize, reflect, etc).
  ![alt tag](http://i214.photobucket.com/albums/cc172/victormafire/image.png)
