import path from "node:path";
import { getLogger } from "@akshat1/js-logger";
import { GetSlug } from "../GetSlug.js";
import { GetURLRelativeToRoot } from "../GetURLRelativeToRoot.js";
import { RenderToString } from "../RenderToString.js";
import { OnShortCode } from "../markdown/extensions/OnShortCode.js";
import { RunnerConfiguration } from "./RunnerConfiguration.js";
import { getCommandLineOptions } from "./commandLineArgs.js";

export interface Template {
  renderToString: RenderToString;
  getSlug: GetSlug;
  getURLRelativeToRoot: GetURLRelativeToRoot;
  getConfig: () => RunnerConfiguration;
  onShortCode?: OnShortCode;
};

const rootLogger = getLogger("Template");

const validateTemplate = (template: Template): boolean => {
  const logger = getLogger("validateTemplate", rootLogger);
  if (typeof template.renderToString !== "function") {
    logger.error("Template does not have a renderToString method.", JSON.stringify(template, null, 2));
    throw new Error("Template does not have a renderToString method.");
  }

  if (typeof template.getSlug !== "function") {
    logger.error("Template does not have a getSlug method.", JSON.stringify(template, null, 2));
    throw new Error("Template does not have a getSlug method.");
  }

  if (typeof template.getURLRelativeToRoot !== "function") {
    logger.error("Template does not have a getURLRelativeToRoot method.", JSON.stringify(template, null, 2));
    throw new Error("Template does not have a getURLRelativeToRoot method.");
  }

  return true;
};

let template: Template;

/**
 * Force a template reload next time it is accessed.
 */
export const flushTemplate = () => {
  getLogger("flushTemplate", rootLogger).debug("Flushing template.");
  template = null;
};

const tryLoading = async (templatePath: string, terminate?: boolean) => {
  try {
    return await import(`${templatePath}?t=${Date.now()}`);
  } catch (err) {
    if (!terminate) {
      return tryLoading(path.join(process.cwd(), templatePath), true);
    }

    throw err;
  }
};

/**
 * We expect this to only be called from the runner; i.e., when Patrika is used from the command line with a template.
 * This file is not involved when Patrika is used programmatically.
 * @returns 
 */
export const loadTemplate = async () => {
  const logger = getLogger("loadTemplate", rootLogger);
  const { template: templatePath } = getCommandLineOptions();
  if (!template) {
    logger.debug(`Loading template from ${templatePath}?t=Date.now()...`);
    logger.debug({
      templatePath,
      cwd: process.cwd(),
    });
    template = (await tryLoading(`${templatePath}?t=${Date.now()}`)).default;
    validateTemplate(template);
  }
  
  return template;
};
