const Testimonial = () => {
  return (
    <div id="testimonial">
      <h2>Testimonial</h2>

      <section>
        <TestimonialCard
          name={"Abhishek"}
          feedback={"Your development skills are pretty good."}
        />

        <TestimonialCard
          name={"Barkha"}
          feedback={"Wow, Nice portfolio, perfectly structured"}
        />

        <TestimonialCard
          name={"Praveen"}
          feedback={"Amazing, seems like a whole react package"}
        />
      </section>
    </div>
  );
};

const TestimonialCard = ({ name, feedback }) => (
  <article>
    <img
      src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
      alt="User"
    />
    <h4>{name}</h4>
    <p>{feedback}</p>
  </article>
);

export default Testimonial;
