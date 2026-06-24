import { motion } from "framer-motion";
import {
  SiDocker,
  SiGit,
  SiJenkins,
  SiKubernetes,
  SiMongodb,
  SiNodedotjs,
  SiPostgresql,
  SiRedis,
  SiSpringboot,
  SiTypescript,
  SiOpenai,
  SiGo,
  SiJavascript,
  SiTerraform,
  SiLinux,
  SiMicrosoftazure,
  SiNginx,
  SiMysql,
  SiAmazondynamodb,
  SiContainerd,
} from "react-icons/si";
import {
  FaAws,
  FaPython,
  FaReact,
  FaRust,
  FaJava,
  FaServer,
} from "react-icons/fa";

const skills = [
  { name: "Java", Icon: FaJava },
  { name: "Python", Icon: FaPython },
  { name: "Go", Icon: SiGo },
  { name: "Rust", Icon: FaRust },
  { name: "TypeScript", Icon: SiTypescript },
  { name: "JavaScript", Icon: SiJavascript },

  { name: "React", Icon: FaReact },
  { name: "Node.js", Icon: SiNodedotjs },
  { name: "Spring Boot", Icon: SiSpringboot },
  { name: "Django", Icon: FaPython },

  { name: "Microservices", Icon: SiDocker },
  { name: "Distributed Systems", Icon: FaServer },
  { name: "LLD", Icon: FaServer },

  { name: "AWS", Icon: FaAws },
  { name: "Azure", Icon: SiMicrosoftazure },
  { name: "Terraform", Icon: SiTerraform },
  { name: "Docker", Icon: SiDocker },
  { name: "Kubernetes", Icon: SiKubernetes },
  { name: "Linux", Icon: SiLinux },
  { name: "Jenkins", Icon: SiJenkins },
  { name: "Redis", Icon: SiRedis },
  { name: "Nginx", Icon: SiNginx },

  { name: "SQL", Icon: SiMysql },
  { name: "PostgreSQL", Icon: SiPostgresql },
  { name: "MongoDB", Icon: SiMongodb },
  { name: "DynamoDB", Icon: SiAmazondynamodb },

  { name: "Git", Icon: SiGit },

  { name: "Agentic AI", Icon: SiOpenai },
  { name: "RAG", Icon: SiOpenai },
];

const skillPages = Array.from(
  { length: Math.ceil(skills.length / 6) },
  (_, index) => skills.slice(index * 6, index * 6 + 6),
);

const SkillPage = ({ skills: pageSkills, hidden = false }) => (
  <div className="skillsPage" aria-hidden={hidden || undefined}>
    {pageSkills.map(({ name, Icon }) => (
      <article className="skillCard" key={name} tabIndex={hidden ? -1 : 0}>
        <Icon />
        <span>{name}</span>
      </article>
    ))}
  </div>
);

const Services = () => (
  <div id="services">
    <h2>Skills</h2>
    <section className="skillsLayout">
      <motion.aside
        className="experienceCard"
        initial={{ opacity: 0, x: "-40%" }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.4 }}
      >
        <h3>3+</h3>
        <p>Years Experience</p>
      </motion.aside>

      <div className="skillsCarousel" aria-label="Technical skills">
        <div className="skillsTrack">
          <div className="skillsSequence">
            {skillPages.map((pageSkills, index) => (
              <SkillPage skills={pageSkills} key={index} />
            ))}
          </div>
          <div className="skillsSequence" aria-hidden="true">
            {skillPages.map((pageSkills, index) => (
              <SkillPage skills={pageSkills} hidden key={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Services;
