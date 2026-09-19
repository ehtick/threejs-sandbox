import { Color } from 'three';
import { NodeMaterial } from 'three/webgpu';
import {
	uniform, Fn, attribute, cameraProjectionMatrix,
	modelViewMatrix, vec4, positionLocal, select
} from 'three/tsl';
import { isSilhouetteEdge } from './helper.js';

export class ConditionalEdgesNodeMaterial extends NodeMaterial {

	constructor() {

		super();
		this._diffuse = uniform( new Color() );

	}

	get color() {

		return this._diffuse.value;

	}

	set color( val ) {

		this._diffuse.value.set( val );

	}

	setup( builder ) {

		this.colorNode = Fn( () => {

			return this._diffuse;

		} )();

		this.vertexNode = Fn( () => {

			const control0 = attribute( 'control0' );
			const control1 = attribute( 'control1' );
			const direction = attribute( 'direction' );

			const mvp = cameraProjectionMatrix.mul( modelViewMatrix );
			const clipPos = mvp.mul( vec4( positionLocal, 1.0 ) ).toVar( 'clipPos' );
			const c0 = mvp.mul( vec4( control0, 1.0 ) ).toVar( 'c0' );
			const c1 = mvp.mul( vec4( control1, 1.0 ) ).toVar( 'c1' );
			const p0 = mvp.mul( vec4( positionLocal, 1.0 ) ).toVar( 'p0' );
			const p1 = mvp.mul( vec4( positionLocal.add( direction ), 1.0 ) ).toVar( 'p1' );

			c0.divAssign( c0.w );
			c1.divAssign( c1.w );
			p0.divAssign( p0.w );
			p1.divAssign( p1.w );

			return select( isSilhouetteEdge( c0.xy, c1.xy, p0.xy, p1.xy ), clipPos, c0 );

		} )();

		super.setup( builder );

	}

}
