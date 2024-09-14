import getLogger from "@akshat1/js-logger";
import { RunnerConfiguration } from "./runner/RunnerConfiguration.js";
import { ContentItem } from "./index.js";
import { getCommandLineOptions } from "./runner/commandLineArgs.js";
import path from "node:path";

export interface Template {
  renderToString: (item: any, patrika: any) => Promise<string|string[]>;
  getSlug: (item: ContentItem) => string;
  getURLRelativeToRoot: (item: ContentItem, pageNumber?: number) => string;
  getConfig: () => RunnerConfiguration;
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
