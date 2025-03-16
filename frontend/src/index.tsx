/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { lazy } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { FaultProvider } from "@components/fault";
import Protected from "@components/protected";
import Blog from "@pages/home/blog.page";

const root = document.getElementById("root");

const Landing = lazy(() => import("./pages/home/landing.page"));
const Support = lazy(() => import("./pages/support/support.page"));
const Privacy = lazy(() => import("./pages/policies/privacy.page"));
const TermService = lazy(() => import("./pages/policies/service.page"));
const AboutUs = lazy(() => import("./pages/support/aboutus.page"));
const Signin = lazy(() => import("./pages/auth/signin.page"));
const Signup = lazy(() => import("./pages/auth/signup.page"));
const Pricing = lazy(() => import("./pages/pricing/pricing.page"));
const Error404 = lazy(() => import("./pages/error/error.404.page"));
const ErrorPayment = lazy(() => import("./pages/error/error.payment.page"));

// Protected Pages
const Home = Protected({ fallback: Landing })(
	lazy(() => import("./pages/home/home.page"))
);
const Account = Protected({ redirect: "/" })(
	lazy(() => import("./pages/auth/account.page"))
);
const Resume = Protected({ redirect: "/" })(
	lazy(() => import("./pages/resume/resume.page"))
);
const History = Protected({ redirect: "/" })(
	lazy(() => import("./pages/resume/history.page"))
);
const Templates = Protected({ redirect: "/" })(
	lazy(() => import("./pages/home/template.page"))
);

render(
	() => (
		<FaultProvider>
			<Router>
				<Route path={["/", "/home"]} component={Home} />
				<Route path={"/welcolm"} component={Landing} />
				<Route path={"/support"} component={Support} />
				<Route path={"/policies/privacy"} component={Privacy} />
				<Route path={"/policies/term-of-services"} component={TermService} />
				<Route path={"/about-us"} component={AboutUs} />
				<Route path={"/signin"} component={Signin} />
				<Route path={"/signup"} component={Signup} />
				<Route path={"/my-templates"} component={Templates} />
				<Route path={"/blog"} component={Blog} />
				<Route path={"/pricing"} component={Pricing} />
				<Route path={"/fail"} component={ErrorPayment} />
				<Route path={"/account"} component={Account} />
				<Route path={"/history"} component={History} />
				<Route path={"/resume/:id"} component={Resume} />
				<Route path={"*"} component={Error404} />
			</Router>
		</FaultProvider>
	),
	root!
);
