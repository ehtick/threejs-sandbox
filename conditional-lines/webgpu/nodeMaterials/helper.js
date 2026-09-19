import { Fn, dot, normalize, sign, vec2, negate } from 'three/tsl';

// An edge is a silhouette when both adjacent faces' control points fall on the same
// side of the edge's supporting line in screen space, which is equivalent to the two
// faces sharing a facing direction.
export const isSilhouetteEdge = Fn( ( [ c0, c1, p0, p1 ] ) => {

	const dir = p1.sub( p0 );
	const norm = vec2( negate( dir.y ), dir.x );

	const d0 = dot( normalize( norm ), normalize( c0.sub( p1 ) ) );
	const d1 = dot( normalize( norm ), normalize( c1.sub( p1 ) ) );

	return sign( d0 ).equal( sign( d1 ) );

} ).setLayout( {
	name: 'isSilhouetteEdge',
	type: 'bool',
	inputs: [
		{ name: 'c0', type: 'vec2' },
		{ name: 'c1', type: 'vec2' },
		{ name: 'p0', type: 'vec2' },
		{ name: 'p1', type: 'vec2' }
	]
} );
