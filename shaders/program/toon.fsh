precision mediump float;

uniform sampler2D DiffuseSampler;
uniform sampler2D NormalSampler;

varying vec2 texCoord;
varying vec2 oneTexel;

uniform float edge_thres; // 0.2;
uniform float edge_thres2; // 5.0;

#define HueLevCount 6
#define SatLevCount 7
#define ValLevCount 4

float HueLevels[6];
float SatLevels[7];
float ValLevels[4];

const float numLayers = 3.0;
const float factor = 1.0/numLayers;


vec3 RGBtoHSV( float r, float g, float b)
{
   float minv, maxv, delta;
   vec3 res;

   minv = min(min(r, g), b);
   maxv = max(max(r, g), b);
   res.z = maxv;            // v

   delta = maxv - minv;

   if( maxv != 0.0 )
      res.y = delta / maxv;      // s
   else {
      // r = g = b = 0      // s = 0, v is undefined
      res.y = 0.0;
      res.x = -1.0;
      return res;
   }

   if( r == maxv )
      res.x = ( g - b ) / delta;      // between yellow & magenta
   else if( g == maxv )
      res.x = 2.0 + ( b - r ) / delta;   // between cyan & yellow
   else
      res.x = 4.0 + ( r - g ) / delta;   // between magenta & cyan

   res.x = res.x * 60.0;            // degrees
   if( res.x < 0.0 )
      res.x = res.x + 360.0;

   return res;
}

vec3 HSVtoRGB(float h, float s, float v )
{
   int i;
   float f, p, q, t;
   vec3 res;

   if( s == 0.0 )
   {
      // achromatic (grey)
      res.x = v;
      res.y = v;
      res.z = v;
      return res;
   }

   h /= 60.0;         // sector 0 to 5
   i = int(floor( h ));
   f = h - float(i);         // factorial part of h
   p = v * ( 1.0 - s );
   q = v * ( 1.0 - s * f );
   t = v * ( 1.0 - s * ( 1.0 - f ) );

   if(i == 0){
        res.x = v;
        res.y = t;
        res.z = p;
   }else if(i == 1){
        res.x = q;
        res.y = v;
        res.z = p;
   }else if(i == 2){
        res.x = p;
        res.y = v;
        res.z = t;
   }else if(i == 3){
        res.x = p;
        res.y = q;
        res.z = v;
   }else if(i == 4){
        res.x = t;
        res.y = p;
        res.z = v;
   }else {
        res.x = v;
        res.y = p;
        res.z = q;
   }

   return res;
}

float nearestLevel(float col, int mode)
{
    int levCount;
    if (mode==0) levCount = HueLevCount;
    if (mode==1) levCount = SatLevCount;
    if (mode==2) levCount = ValLevCount;

    if (mode==0) {
        for (int i =0; i<HueLevCount-1; i++ ) {
            if (col >= HueLevels[i] && col <= HueLevels[i+1]) {
                return HueLevels[i+1];
            }
        }
    }

    if (mode==1) {
        for (int i =0; i<SatLevCount-1; i++ ) {
            if (col >= SatLevels[i] && col <= SatLevels[i+1]) {
                return SatLevels[i+1];
            }
        }
    }

    if (mode==2) {
        for (int i =0; i<ValLevCount-1; i++ ) {
            if (col >= ValLevels[i] && col <= ValLevels[i+1]) {
                return ValLevels[i+1];
            }
        }
    }

    return 0.0;
}

// averaged pixel intensity from 3 color channels
float avg_intensity(vec4 pix)
{
 return (pix.r + pix.g + pix.b)/3.;
}

vec4 get_pixel(vec2 coords, float dx, float dy)
{
 return texture2D(NormalSampler, coords + vec2(dx, dy));
}

vec4 calculateSobel(vec2 coords){
    float sobelX[9];
    sobelX[0] = 1.0; sobelX[1] = 0.0; sobelX[2] = -1.0;
    sobelX[3] = 2.0; sobelX[4] = 0.0; sobelX[5] = -2.0;
    sobelX[6] = 1.0; sobelX[7] = 0.0; sobelX[8] = -1.0;

    float sobelY[9];
    sobelY[0] = 1.0; sobelY[1] = 2.0; sobelY[2] =  1.0;
    sobelY[3] = 0.0; sobelY[4] = 0.0; sobelY[5] =  0.0;
    sobelY[6] = -1.0; sobelY[7] = -2.0; sobelY[8] = -1.0;

    float avg[9];

    avg[0] = avg_intensity(get_pixel(coords, float(-1)*oneTexel.x, float(-1)*oneTexel.y));
    avg[1] = avg_intensity(get_pixel(coords, float(-1)*oneTexel.x, float(0)*oneTexel.y));
    avg[2] = avg_intensity(get_pixel(coords, float(-1)*oneTexel.x, float(1)*oneTexel.y));
    avg[3] = avg_intensity(get_pixel(coords, float(0)*oneTexel.x, float(-1)*oneTexel.y));
    avg[4] = avg_intensity(get_pixel(coords, float(0)*oneTexel.x, float(0)*oneTexel.y));
    avg[5] = avg_intensity(get_pixel(coords, float(0)*oneTexel.x, float(1)*oneTexel.y));
    avg[6] = avg_intensity(get_pixel(coords, float(1)*oneTexel.x, float(-1)*oneTexel.y));
    avg[7] = avg_intensity(get_pixel(coords, float(1)*oneTexel.x, float(0)*oneTexel.y));
    avg[8] = avg_intensity(get_pixel(coords, float(1)*oneTexel.x, float(1)*oneTexel.y));

    vec4 texelX = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 texelY = vec4(0.0, 0.0, 0.0, 1.0);

    for (int i = 0; i < 9; i++)
    {
        float average = avg[i];
        texelX += vec4(average, average, average, 1.0)  * sobelX[i];
        texelY += vec4(average, average, average, 1.0)  * sobelY[i];
    }

    return sqrt(texelX*texelX + texelY*texelY);
}

// returns pixel color
float IsEdge(vec2 coords)
{
    float dxtex = oneTexel.x;
    float dytex = oneTexel.y;
    float pix[9];
    int k = -1;
    float delta;

    // read neighboring pixel intensities
    pix[0] = avg_intensity(get_pixel(coords, float(-1)*dxtex, float(-1)*dytex));
    pix[1] = avg_intensity(get_pixel(coords, float(-1)*dxtex, float(0)*dytex));
    pix[2] = avg_intensity(get_pixel(coords, float(-1)*dxtex, float(1)*dytex));
    pix[3] = avg_intensity(get_pixel(coords, float(0)*dxtex, float(-1)*dytex));
    pix[4] = avg_intensity(get_pixel(coords, float(0)*dxtex, float(0)*dytex));
    pix[5] = avg_intensity(get_pixel(coords, float(0)*dxtex, float(1)*dytex));
    pix[6] = avg_intensity(get_pixel(coords, float(1)*dxtex, float(-1)*dytex));
    pix[7] = avg_intensity(get_pixel(coords, float(1)*dxtex, float(0)*dytex));
    pix[8] = avg_intensity(get_pixel(coords, float(1)*dxtex, float(1)*dytex));

    // average color differences around neighboring pixels
    delta = (abs(pix[1]-pix[7])+
            abs(pix[5]-pix[3]) +
            abs(pix[0]-pix[8]) +
            abs(pix[2]-pix[6])
            )/4.;

  //return clamp(5.5*delta,0.0,1.0);
  return clamp(edge_thres2*delta,0.0,1.0);
}

void main(){

    vec4 center = texture2D(NormalSampler, texCoord);

    // float l = max(center.x, max(center.y, center.z));
    // float l = length(center);
    float l = length(vec3(1.0,1.0,1.0));

    vec3 percentToMax = center.xyz / l;
    vec3 layered = ceil(percentToMax * numLayers);
    vec3 factored = layered * factor;

    vec4 sobel = calculateSobel(texCoord);

    if(sobel.r == 1.0)
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    else
        gl_FragColor = vec4(center.xyz, 1.0 - sobel.r);
}


void mainAux()
{
    HueLevels[0] = 0.0;
    HueLevels[1] = 140.0;
    HueLevels[2] = 160.0;
    HueLevels[3] = 240.0;
    HueLevels[4] = 240.0;
    HueLevels[5] = 360.0;

    SatLevels[0] = 0.0;
    SatLevels[1] = 0.15;
    SatLevels[2] = 0.3;
    SatLevels[3] = 0.45;
    SatLevels[4] = 0.6;
    SatLevels[5] = 0.8;
    SatLevels[5] = 1.0;

    ValLevels[0] = 0.0;
    ValLevels[1] = 0.3;
    ValLevels[2] = 0.6;
    ValLevels[3] = 1.0;


    vec3 colorOrg = texture2D(NormalSampler, texCoord).rgb;
    vec3 vHSV =  RGBtoHSV(colorOrg.r,colorOrg.g,colorOrg.b);
    vHSV.x = nearestLevel(vHSV.x, 0);
    vHSV.y = nearestLevel(vHSV.y, 1);
    vHSV.z = nearestLevel(vHSV.z, 2);
    float edg = IsEdge(texCoord);
    vec3 vRGB = (edg >= edge_thres)? vec3(0.0,0.0,0.0): HSVtoRGB(vHSV.x,vHSV.y,vHSV.z);
    gl_FragColor = vec4(vRGB.x,vRGB.y,vRGB.z, 1.0);
}