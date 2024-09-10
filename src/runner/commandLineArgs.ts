import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

interface CommandLineOptions {
  help: boolean;
  config: string;
  verbose: boolean;
  watch: boolean;
  serve: boolean;
}

const clOptionDefinitions = [{
  name: "help",
  alias: "h",
  type: Boolean,
  description: "Print this usage guide.",
}, {
  name: "config",
  alias: "c",
  type: String,
  description: "Path to the configuration file.",
}, {
  name: "verbose",
  alias: "v",
  type: Boolean,
  description: "Not implemented yet; everything is verbose ATM.",
}, {
  name: "watch",
  alias: "w",
  type: Boolean,
  description: "Watch for changes and rebuild.",
}, {
  name: "serve",
  alias: "s",
  type: Boolean,
  description: "Start a live reloading server. This also implies --watch (and ocverrides any explicit value for it).",
}];

interface PrintUsageHelpArgs {
  errorMessage?: string;
}

export const printUsageHelp = (args: PrintUsageHelpArgs = {}) => {
  const { errorMessage } = args;
  const sections: Record<string, unknown>[] = [{
    header: "Patrika Runner",
    content: "A tool to turn your markdown and temmplates into a static website.",
  }, {
    header: "Sample Usage",
    content: "$ patrika-runner -c patrika-config.json",
  }];

  if (errorMessage) {
    sections.push({
      header: "Error",
      content: errorMessage,
    });
  }

  sections.push({
    header: "Options",
    optionList: clOptionDefinitions,
  }, {
    header: "Project Information",
    content: "Project home: https://kabukisolutions.com/patrika",
  });

  const usage = commandLineUsage(sections);
  console.log(usage);
};

let clOptions: CommandLineOptions;
export const getCommandLineOptions = (): CommandLineOptions => {
  if (clOptions) {
    return clOptions;
  }

  clOptions = commandLineArgs(clOptionDefinitions);
  return clOptions;
}

/**
 * Validate the command line options. Display help or appropriate error messages and exit if needed.
 */
export const doCommandLineValidation = () => {
  const clOptions = getCommandLineOptions();
  if (clOptions.help) {
    printUsageHelp();
    process.exit(0);
  }

  if (!clOptions.config) {
    printUsageHelp({ errorMessage: "Configuration file is required." });
    process.exit(1);
  }
};
