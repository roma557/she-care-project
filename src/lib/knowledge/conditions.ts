import type { Condition, ConditionCategory } from "./types";

export const CONDITION_CATEGORIES: ConditionCategory[] = [
  { id: "menstrual-cycle", label: "Cycle & Bleeding" },
  { id: "vaginal-infections", label: "Vaginal Infections" },
  { id: "structural-pain", label: "Structural & Pain" },
  { id: "hormonal-systemic", label: "Hormonal & Systemic" },
];

export const CONDITIONS: Condition[] = [
  // Menstrual Cycle & Bleeding Disorders
  {
    id: "endometriosis",
    name: "Endometriosis",
    categoryId: "menstrual-cycle",
    description:
      "Tissue similar to the uterine lining grows outside the uterus — on ovaries, fallopian tubes, or pelvic organs. It causes chronic pelvic pain, painful periods, heavy bleeding, pain during intercourse, and can affect fertility.",
    keywords: ["endometriosis", "endo", "pelvic pain", "painful period", "deep pain", "fertility"],
    seeDoctor: "Seek evaluation for severe period pain, pain with sex, or difficulty conceiving.",
  },
  {
    id: "adenomyosis",
    name: "Adenomyosis",
    categoryId: "menstrual-cycle",
    description:
      "A condition where the uterine lining grows directly into the muscular walls of the uterus, causing severe pain and heavy flows.",
    keywords: ["adenomyosis", "heavy flow", "severe pain", "uterine wall", "bulky uterus"],
    seeDoctor: "Talk to your gynecologist if periods are increasingly painful or very heavy.",
  },
  {
    id: "fibroids",
    name: "Fibroids",
    categoryId: "menstrual-cycle",
    description:
      "Non-cancerous muscular tumors that grow in or on the walls of the uterus, often causing severe abdominal cramping and prolonged bleeding.",
    keywords: ["fibroids", "fibroid", "uterine tumor", "cramping", "prolonged bleeding", "myoma"],
    seeDoctor: "Get an ultrasound if you have heavy bleeding, pelvic pressure, or anemia symptoms.",
  },
  {
    id: "uterine-polyps",
    name: "Uterine Polyps",
    categoryId: "menstrual-cycle",
    description:
      "Small, bulb-like growths attached to the inner wall of the uterus that trigger unpredictable spotting between cycles.",
    keywords: ["polyps", "uterine polyp", "spotting", "between periods", "irregular bleeding"],
    seeDoctor: "Report spotting between periods or after menopause to your doctor promptly.",
  },
  {
    id: "amenorrhea",
    name: "Amenorrhea",
    categoryId: "menstrual-cycle",
    description:
      "The complete absence of periods, categorized as primary (never starting by age 15) or secondary (missing three or more consecutive cycles).",
    keywords: ["amenorrhea", "no period", "missed periods", "absent period", "stopped bleeding"],
    seeDoctor: "Missing three or more cycles warrants a hormonal and thyroid workup.",
  },
  {
    id: "menorrhagia",
    name: "Menorrhagia",
    categoryId: "menstrual-cycle",
    description:
      "The medical term for abnormally heavy or prolonged menstrual bleeding that interferes with daily activities.",
    keywords: ["menorrhagia", "heavy bleeding", "heavy period", "soaking pads", "prolonged period"],
    seeDoctor: "Seek care if you soak through pads hourly or feel dizzy or fatigued during periods.",
  },
  {
    id: "dysmenorrhea",
    name: "Dysmenorrhea",
    categoryId: "menstrual-cycle",
    description:
      "Severe, painful cramping during a period, which can be a standalone symptom or caused by underlying conditions like endometriosis or fibroids.",
    keywords: ["dysmenorrhea", "period cramps", "painful cramps", "cramping", "severe cramps"],
    seeDoctor: "Pain that limits daily life or worsens over time should be evaluated — not dismissed as normal.",
  },

  // Vaginal & Vulvar Infections
  {
    id: "bacterial-vaginosis",
    name: "Bacterial Vaginosis (BV)",
    categoryId: "vaginal-infections",
    description:
      "An overgrowth of naturally occurring bacteria in the vagina, causing a thin, watery discharge and a distinct fishy odor.",
    keywords: ["bv", "bacterial vaginosis", "fishy odor", "watery discharge", "vaginal infection"],
    seeDoctor: "BV is treatable — see a doctor for proper diagnosis rather than self-treating.",
  },
  {
    id: "yeast-infection",
    name: "Vaginal Yeast Infection",
    categoryId: "vaginal-infections",
    description:
      "An overgrowth of Candida fungus, which triggers intense itching, burning during urination, and thick, white discharge.",
    keywords: ["yeast", "candida", "itching", "white discharge", "thrush", "fungal infection"],
    seeDoctor: "Recurrent yeast infections may signal an underlying issue — discuss with your gynecologist.",
  },
  {
    id: "trichomoniasis",
    name: "Trichomoniasis",
    categoryId: "vaginal-infections",
    description:
      "A common, curable sexually transmitted infection (STI) caused by a microscopic parasite that generates a foul-smelling, green-yellow discharge.",
    keywords: ["trichomoniasis", "trich", "sti", "std", "green discharge", "yellow discharge"],
    seeDoctor: "Both partners should be tested and treated if trichomoniasis is confirmed.",
  },
  {
    id: "vaginitis",
    name: "Vaginitis",
    categoryId: "vaginal-infections",
    description:
      "A general medical term describing any inflammation, swelling, or infection of the vaginal tissue.",
    keywords: ["vaginitis", "vaginal inflammation", "swelling", "irritation", "vaginal infection"],
    seeDoctor: "Different causes need different treatments — a swab test helps identify the right one.",
  },

  // Structural & Pain Disorders
  {
    id: "vaginismus",
    name: "Vaginismus",
    categoryId: "structural-pain",
    description:
      "Involuntary, painful tensing or spasming of the vaginal muscles when vaginal penetration is attempted.",
    keywords: ["vaginismus", "muscle spasm", "painful penetration", "tightening", "pelvic floor"],
    seeDoctor: "Pelvic floor physiotherapy and counseling are effective — you are not alone.",
  },
  {
    id: "vulvodynia",
    name: "Vulvodynia",
    categoryId: "structural-pain",
    description:
      "Chronic, unexplained pain, burning, or rawness around the opening of the vagina that lasts for months without an obvious physical cause.",
    keywords: ["vulvodynia", "vulvar pain", "burning", "chronic pain", "rawness"],
    seeDoctor: "Persistent vulvar pain deserves specialist evaluation — many treatments can help.",
  },
  {
    id: "pelvic-organ-prolapse",
    name: "Pelvic Organ Prolapse",
    categoryId: "structural-pain",
    description:
      "A structural shift where the bladder, uterus, or bowel drops out of its normal position and pushes down against the vaginal walls.",
    keywords: ["prolapse", "pelvic organ prolapse", "bulge", "pressure", "bladder drop", "uterine prolapse"],
    seeDoctor: "A heaviness or bulge in the vagina should be assessed — options range from exercises to surgery.",
  },

  // Hormonal & Systemic Disorders
  {
    id: "pid",
    name: "Pelvic Inflammatory Disease (PID)",
    categoryId: "hormonal-systemic",
    description:
      "An infection of the reproductive organs — usually triggered by untreated STIs — that can cause severe pelvic pain and scarring.",
    keywords: ["pid", "pelvic inflammatory", "pelvic infection", "sti complication", "scarring"],
    seeDoctor: "PID needs prompt antibiotic treatment to protect fertility — do not delay care.",
  },
  {
    id: "pmdd",
    name: "Premenstrual Dysphoric Disorder (PMDD)",
    categoryId: "hormonal-systemic",
    description:
      "A severe, sometimes debilitating extension of PMS that causes extreme emotional distress, depression, and anxiety before a period.",
    keywords: ["pmdd", "pms", "premenstrual", "mood before period", "anxiety before period", "depression"],
    seeDoctor: "If premenstrual symptoms disrupt work or relationships, ask about PMDD screening and treatment.",
  },
];

export function getConditionsByCategory(categoryId: ConditionCategoryId): Condition[] {
  return CONDITIONS.filter((c) => c.categoryId === categoryId);
}
