import { Suspense, useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
	Canvas,
	useLoader,
	useFrame,
	extend,
	useThree,
} from "@react-three/fiber";

// IMGs
import CircleImg from "./assets/img/circle.png";

extend({ OrbitControls });

function CameraControls() {
	const {
		camera,
		gl: { domElement },
	} = useThree();

	const controlsRef = useRef<OrbitControls>();

	useFrame(() => controlsRef.current?.update());

	return (
		// @ts-ignore
		<orbitControls
			ref={controlsRef}
			args={[camera, domElement]}
			autoRotate
			autoRotateSpeed={-0.2}
		/>
	);
}

// LOCAL COMPONENTS
function Points() {
	const pointTexture = useLoader(THREE.TextureLoader, CircleImg);

	const bufferRef = useRef<THREE.BufferAttribute>(null);

	let t = 0;
	let f = 0.002;
	let a = 3;

	const graph = useCallback(
		(x, z) => {
			return Math.sin(f * (x ** 2 + z ** 2 + t)) * a;
		},
		[t, f, a]
	);

	const count = 100;
	const sep = 3;

	const positions: ArrayLike<number> = useMemo(() => {
		let positions = [];
		for (let xi = 0; xi < count; xi++) {
			for (let zi = 0; zi < count; zi++) {
				let x = sep * (xi - count / 2);
				let z = sep * (zi - count / 2);
				let y = graph(x, z);

				positions.push(x, y, z);
			}
		}

		return new Float32Array(positions);
	}, [count, sep, graph]);

	useFrame(() => {
		t += 15;

		let positions = bufferRef.current?.array || [];

		let i = 0;
		for (let xi = 0; xi < count; xi++) {
			for (let zi = 0; zi < count; zi++) {
				let x = sep * (xi - count / 2);
				let z = sep * (zi - count / 2);

				// @ts-ignore
				positions[i + 1] = graph(x, z);
				i += 3;
			}
		}

		if (bufferRef.current) bufferRef.current.needsUpdate = true;
	});

	return (
		<points>
			<bufferGeometry attach="geometry">
				<bufferAttribute
					ref={bufferRef}
					attachObject={["attributes", "position"]}
					array={positions}
					count={positions.length / 2}
					itemSize={3}
				/>
			</bufferGeometry>

			<pointsMaterial
				attach="material"
				map={pointTexture}
				color={0x00aaff}
				size={0.5}
				sizeAttenuation
				transparent={false}
				alphaTest={0.5}
				opacity={1.0}
			/>
		</points>
	);
}

function AnimationCanvas() {
	return (
		<Canvas camera={{ position: [100, 10, 0], fov: 75 }}>
			<Suspense fallback={null}>
				<Points />
			</Suspense>
			<CameraControls />
		</Canvas>
	);
}

function App() {
	return (
		<div className="App">
			<Suspense fallback={<div>Loading ... </div>}>
				<AnimationCanvas />
			</Suspense>
		</div>
	);
}

export default App;
