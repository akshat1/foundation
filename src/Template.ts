import getLogger from "@akshat1/js-logger";
import { getRunnerConfig } from "./runner/getConfiguration.js";
import { GetSlug } from "./GetSlug.js";

export interface Template {
  renderToString: (item: any, patrika: any) => Promise<string|string[]>;
  getSlug: GetSlug;
};

const rootLogger = getLogger("Template");

const validateTemplate = (template: Template): boolean => {
  const logger = getLogger("validateTemplate", rootLogger);
  if (typeof template.renderToString !== "function") {
    logger.error("Template does not have a renderToString method.", JSON.stringify(template, null, 2));
    throw new Error("Template does not have a renderToString method.");
  }

  return true;
};

let template: Template;

/**
 * Force a template reload next time it is accessed.
 */
export const flushTemplate = () => {
  template = null;
};

export const loadTemplate = async () => {
  const logger = getLogger("loadTemplate", rootLogger);
  const { template: templatePath } = await getRunnerConfig();
  if (!template) {
    logger.debug(`Loading template from ${templatePath}?t=Date.now()...`);
    template = await import(`${templatePath}?t=${Date.now()}`);
    validateTemplate(template);
  } else {
    logger.debug("Template already loaded. Skipping reload.");
  }
  
  return template;
};
