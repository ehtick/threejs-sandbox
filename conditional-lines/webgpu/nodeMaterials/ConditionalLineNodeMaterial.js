
import {
	vec4,
	attribute,
	cameraProjectionMatrix,
	modelViewMatrix,
	select
} from 'three/tsl';
import { Line2NodeMaterial } from 'three/webgpu';
import { isSilhouetteEdge } from './helper.js';

class ConditionalLineNodeMaterial extends Line2NodeMaterial {

	static get type() {

		return 'ConditionalLineNodeMaterial';

	}

	constructor( parameters = {} ) {

		super( parameters );
		this.isConditionalLineNodeMaterial = true;

	}

	set lineColor( val ) {

		this.lineColorNode = val;

	}

	setupVertex( builder ) {

		const mvp = super.setupVertex( builder );
		const lineClip = this.vertexNode || mvp;

		const control0 = attribute( 'control0' );
		const control1 = attribute( 'control1' );
		const direction = attribute( 'direction' );
		const instanceStart = attribute( 'instanceStart' );

		const proj = cameraProjectionMatrix.mul( modelViewMatrix );

		const c0Clip = proj.mul( vec4( control0, 1.0 ) );
		const c1Clip = proj.mul( vec4( control1, 1.0 ) );
		const p0Clip = proj.mul( vec4( instanceStart, 1.0 ) );
		const p1Clip = proj.mul( vec4( instanceStart.add( direction ), 1.0 ) );

		const c0 = c0Clip.div( c0Clip.w );
		const c1 = c1Clip.div( c1Clip.w );
		const p0 = p0Clip.div( p0Clip.w );
		const p1 = p1Clip.div( p1Clip.w );

		// Collapse all vertices of a non-silhouette segment onto a single point so the
		// instanced quad degenerates and rasterizes nothing.
		this.vertexNode = select( isSilhouetteEdge( c0.xy, c1.xy, p0.xy, p1.xy ), lineClip, c0 );

		return this.vertexNode;

	}

}

export { ConditionalLineNodeMaterial };
