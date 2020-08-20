const { useEffect, useState } = require("react");

export function useGetBound(ref) {
	const [state, setState] = useState();
	useEffect(() => {
		if (ref.current) {
			const { width, height } = ref.current.getBoundingClientRect();
			setState({ width, height });
		}
		const fn = () => {
			const { width, height } = ref.current.getBoundingClientRect();
			setState({ width, height });
		};
		window.addEventListener("resize", fn);
		return () => {
			window.removeEventListener("resize", fn);
		};
	}, [ref]);
	return state;
}
export function useGetBodyBound() {
	const [state, setState] = useState();
	useEffect(() => {
		const { width, height } = document.body.getBoundingClientRect();
		setState({ width, height });
		const fn = () => {
			const { width, height } = document.body.getBoundingClientRect();
			setState({ width, height });
		};
		window.addEventListener("resize", fn);
		return () => {
			window.removeEventListener("resize", fn);
		};
	}, []);
	return state;
}
