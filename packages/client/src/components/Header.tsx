import { JSXElement } from "solid-js"

interface Props {
	children: JSXElement
}

export default function Header(props: Props) {
	return (
		<header class="flex justify-between items-center p-4">
			<button></button>
			<strong>{props.children}</strong>
			<button></button>
		</header>
	)
}
