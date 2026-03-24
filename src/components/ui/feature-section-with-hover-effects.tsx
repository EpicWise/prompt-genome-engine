import { cn } from "@/lib/utils";
import {
  IconTarget,
  IconBulb,
  IconLayoutGrid,
  IconCode,
  IconFileCheck,
  IconTool,
  IconShieldCheck,
} from "@tabler/icons-react";

const dimensions = [
  {
    title: "Clarity & Specificity",
    description:
      "Is it unambiguous? Could a brilliant new employee with zero context follow it perfectly?",
    icon: <IconTarget />,
  },
  {
    title: "Context & Motivation",
    description:
      "Does it explain why, not just what? Context helps the model generalize beyond literal instructions.",
    icon: <IconBulb />,
  },
  {
    title: "Structure & Organization",
    description:
      "XML tags, clear sections, consistent naming — structural elements that prevent misinterpretation.",
    icon: <IconLayoutGrid />,
  },
  {
    title: "Examples & Few-Shot",
    description:
      "3-5 diverse examples covering typical cases and edge cases, balanced across categories.",
    icon: <IconCode />,
  },
  {
    title: "Output Contract",
    description:
      "Does it define what done looks like? Format, length, tone, required fields, fallback behavior.",
    icon: <IconFileCheck />,
  },
  {
    title: "Technique Fitness",
    description:
      "Right techniques for the use case — CoT for reasoning, ReAct for agents, grounding for RAG.",
    icon: <IconTool />,
  },
  {
    title: "Robustness & Edge Cases",
    description:
      "Prompt injection defense, hallucination guardrails, uncertainty handling, and safety rails.",
    icon: <IconShieldCheck />,
  },
];

export function DimensionsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 w-full">
      {dimensions.map((dimension, index) => (
        <Feature key={dimension.title} {...dimension} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-neutral-200",
        (index === 0 || index === 4) && "lg:border-l border-neutral-200",
        index < 4 && "lg:border-b border-neutral-200"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-500">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 group-hover/feature:bg-neutral-900 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-900">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-500 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
