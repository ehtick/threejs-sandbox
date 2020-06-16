// https://www.shadertoy.com/view/4t2fRz

export const LensDistortionShader = {

	defines: {

		// 0: NONE, 1: RGB, 2: RYGCBV
		BAND_MODE: 2,

	},

	uniforms: {

		tDiffuse: { value: null },
		intensity: { value: 0.075 },
		bandOffset: { value: 0.0 },
		jitterIntensity: { value: 1.0 },
		jitterOffset: { value: 0.0 },

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;
		varying vec3 viewDir;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			viewDir = normalize( ( modelViewMatrix * vec4( position, 1.0 ) ).xyz );

		}

	`,

	fragmentShader: /* glsl */`

		varying vec2 vUv;
		varying vec3 viewDir;
		uniform float intensity;
		uniform float bandOffset;
		uniform float jitterIntensity;
		uniform float jitterOffset;
		uniform sampler2D tDiffuse;

		#include <common>
		void main() {

			vec3 normal = viewDir.xyz;
			normal.z = 1.0;
			normal = normalize( normal );

			vec3 color;

			// if NO BANDS
			#if BAND_MODE == 0

			vec3 refracted = refract( vec3( 0.0, 0.0, - 1.0 ), - normal, intensity );
			color = texture2D( tDiffuse, vUv + normal.xy - refracted.xy ).rgb;

			// if RGB or RYGCBV BANDS
			#else

			float index, randValue, offsetValue;
			float r, g, b;
			vec3 r_refracted, g_refracted, b_refracted;
			vec4 r_sample, g_sample, b_sample;

			#if BAND_MODE == 2
			float y, c, v;
			vec3 y_refracted, c_refracted, v_refracted;
			vec4 y_sample, c_sample, v_sample;
			#endif

			#pragma unroll_loop_start
			for ( int i = 0; i < 10; i ++ ) {

				index = float( UNROLLED_LOOP_INDEX );
				randValue = rand( sin( index ) * gl_FragCoord.xy + vec2( jitterOffset, - jitterOffset ) ) - 0.5;
				offsetValue = index / 9.0 + randValue * jitterIntensity;
				#if BAND_MODE == 1
				randValue *= 2.0;
				#endif

				// Paper describing functions for creating yellow, cyan, and violet bands and reforming
				// them into RGB:
				// https://web.archive.org/web/20061108181225/http://home.iitk.ac.in/~shankars/reports/dispersionraytrace.pdf
				r_refracted = refract( vec3( 0.0, 0.0, - 1.0 ), - normal, intensity + intensity * bandOffset * 0.0 + intensity * bandOffset * offsetValue );
				g_refracted = refract( vec3( 0.0, 0.0, - 1.0 ), - normal, intensity + intensity * bandOffset * 2.0 + intensity * bandOffset * offsetValue );
				b_refracted = refract( vec3( 0.0, 0.0, - 1.0 ), - normal, intensity + intensity * bandOffset * 4.0 + intensity * bandOffset * offsetValue );

				r_sample = texture2D( tDiffuse, vUv + ( normal.xy - r_refracted.xy ) );
				g_sample = texture2D( tDiffuse, vUv + ( normal.xy - g_refracted.xy ) );
				b_sample = texture2D( tDiffuse, vUv + ( normal.xy - b_refracted.xy ) );

				#if BAND_MODE == 2
				y_refracted = refract( vec3( 0.0, 0.0, - 1.0 ), - normal, intensity + intensity * bandOffset * 1.0 + intensity * bandOffset * offsetValue );
				c_refracted = refract( vec3( 0.0, 0.0, - 1.0 ), - normal, intensity + intensity * bandOffset * 3.0 + intensity * bandOffset * offsetValue );
				v_refracted = refract( vec3( 0.0, 0.0, - 1.0 ), - normal, intensity + intensity * bandOffset * 5.0 + intensity * bandOffset * offsetValue );

				y_sample = texture2D( tDiffuse, vUv + ( normal.xy - y_refracted.xy ) );
				c_sample = texture2D( tDiffuse, vUv + ( normal.xy - c_refracted.xy ) );
				v_sample = texture2D( tDiffuse, vUv + ( normal.xy - v_refracted.xy ) );

				r = r_sample.r / 2.0;
				y = ( 2.0 * y_sample.r + 2.0 * y_sample.g - y_sample.b ) / 6.0;
				g = g_sample.g / 2.0;
				c = ( 2.0 * c_sample.g + 2.0 * c_sample.b - c_sample.r ) / 6.0;
				b = b_sample.b / 2.0;
				v = ( 2.0 * v_sample.b + 2.0 * v_sample.r - v_sample.g ) / 6.0;

				color.r += r + ( 2.0 * v + 2.0 * y - c ) / 3.0;
				color.g += g + ( 2.0 * y + 2.0 * c - v ) / 3.0;
				color.b += b + ( 2.0 * c + 2.0 * v - y ) / 3.0;
				#else
				color.r += r_sample.r;
				color.g += g_sample.g;
				color.b += b_sample.b;
				#endif

			}
			#pragma unroll_loop_end

			color /= 10.0;

			#endif

			gl_FragColor = vec4( color, 1.0 );

		}

	`,

};