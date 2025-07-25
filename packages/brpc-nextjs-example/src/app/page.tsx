import { SuspendedComponent } from "./_components/suspended-component";
import { api } from "./api";

export default async function Page() {
	await api.currentTime({});

	return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<SuspendedComponent />
		</div>
	);
}
