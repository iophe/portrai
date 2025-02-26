/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { lazy } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { FaultProvider } from "@components/fault";
import Protected from "@components/protected";
import Templates from "@pages/home/template.page";
import Blog from "@pages/home/blog.page";

const root = document.getElementById("root");

const Landing = lazy(() => import("./pages/home/landing.page"));
const Signin = lazy(() => import("./pages/auth/signin.page"));
const Signup = lazy(() => import("./pages/auth/signup.page"));
const Pricing = lazy(() => import("./pages/pricing/pricing.page"));


// Protected Pages
const Home = Protected({ fallback: Landing })(
	lazy(() => import("./pages/home/home.page"))
);
const Account = Protected({ redirect: "/" })(
	lazy(() => import("./pages/auth/account.page"))
);
const Success = Protected({ redirect: "/" })(
	lazy(() => import("./pages/payment/success.page"))
);

render(
	() => (
		<FaultProvider>
			<Router>
				<Route path={["/", "/home"]} component={Home} />
				<Route path={"/welcolm"} component={Landing} />
				<Route path={"/signin"} component={Signin} />
				<Route path={"/signup"} component={Signup} />
				<Route path={"/template"} component={Templates} />
				<Route path={"/blog"} component={Blog} />
				<Route path={"/pricing"} component={Pricing} />
				<Route path={"/success"} component={Success} />
				<Route path={"/account"} component={Account} />
			</Router>
		</FaultProvider>
	),
	root!
);
