import { RunTime } from "../../cc/run-time";

export default function echo(runtime: RunTime, ...args: any[]) {
    runtime.logger.info(args.join(", "));
    console.log(args);
}
