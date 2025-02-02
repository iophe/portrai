/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { lazy } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { FaultProvider } from "@components/fault";
import Protected from "@components/protected";

const root = document.getElementById("root");

const Landing = lazy(() => import("./pages/home/landing.page"));
const Signin = lazy(() => import("./pages/auth/signin.page"));
const Signup = lazy(() => import("./pages/auth/signup.page"));
const Products = lazy(() => import("./pages/products/products.page"));
const Pricing = lazy(() => import("./pages/pricing/pricing.page"));

// Protected Pages
const Home = Protected({ fallback: Landing })(
	lazy(() => import("./pages/home/home.page"))
);
const User = Protected({ redirect: "/" })(
	lazy(() => import("./pages/pricing/pricing.page"))
);

render(
	() => (
		<FaultProvider>
			<Router>
				<Route path={["/", "/home"]} component={Home} />
				<Route path={"/signin"} component={Signin} />
				<Route path={"/signup"} component={Signup} />
				<Route path={"/products"} component={Products} />
				<Route path={"/pricing"} component={Pricing} />
			</Router>
		</FaultProvider>
	),
	root!
);
