/* script.js - comportamento do site (carousel, counters, menu e form) */

document.addEventListener('DOMContentLoaded', function(){

  // year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Hamburger menu (mobile)
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  // Smooth scroll for anchor links & Agendar button
  document.querySelectorAll('a[href^="#"], button#btnAgendar').forEach(el => {
    el.addEventListener('click', e => {
      const href = el.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
      } else if (el.id === 'btnAgendar') {
        // scroll to contact
        const target = document.querySelector('#contato');
        if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Simple carousel (touch + arrows)
  const track = document.getElementById('carouselTrack');
  const slides = [...track.children];
  const leftBtn = document.querySelector('.carousel-nav.left');
  const rightBtn = document.querySelector('.carousel-nav.right');
  let index = 0;

  function updateCarousel(){
    const w = track.clientWidth;
    track.style.transform = `translateX(${-index * w}px)`;
  }

  window.addEventListener('resize', updateCarousel);

  leftBtn.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    updateCarousel();
  });
  rightBtn.addEventListener('click', () => {
    index = Math.min(slides.length - 1, index + 1);
    updateCarousel();
  });

  // touch support
  let startX = 0, currentX = 0, isDown = false;
  track.addEventListener('pointerdown', (e) => {
    isDown = true; startX = e.clientX;
    track.style.transition = 'none';
  });
  track.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    currentX = e.clientX;
    const diff = currentX - startX;
    track.style.transform = `translateX(${-index * track.clientWidth + diff}px)`;
  });
  track.addEventListener('pointerup', (e) => {
    isDown = false; track.style.transition = '';
    const diff = e.clientX - startX;
    if (diff > 80) index = Math.max(0, index - 1);
    if (diff < -80) index = Math.min(slides.length - 1, index + 1);
    updateCarousel();
  });
  track.addEventListener('pointerleave', () => { if (isDown) { isDown = false; updateCarousel(); } });

  // Counters animation (IntersectionObserver + increment)
  const counters = document.querySelectorAll('.count');
  const options = { root: null, threshold: 0.4 };
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.target;
        animateCount(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, options);
  counters.forEach(c => counterObserver.observe(c));

  function animateCount(el, to){
    const duration = 1600;
    const frameRate = 60;
    const totalFrames = Math.round((duration / 1000) * frameRate);
    let frame = 0;
    const start = 0;
    const easeOut = t => (--t)*t*t+1;
    const tick = () => {
      frame++;
      const progress = easeOut(frame/totalFrames);
      const value = Math.round(start + (to - start) * progress);
      el.textContent = value;
      if (frame < totalFrames) requestAnimationFrame(tick);
    };
    tick();
  }

  // Testimonials auto-rotate
  const testi = document.querySelectorAll('.testi');
  let tIndex = 0;
  setInterval(() => {
    testi[tIndex].classList.remove('active');
    tIndex = (tIndex + 1) % testi.length;
    testi[tIndex].classList.add('active');
  }, 5500);

  // Simple form handler (static hosting friendly)
  const form = document.getElementById('bookingForm');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const data = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      type: form.type.value,
      date: form.date.value,
      time: form.time.value,
      message: form.message.value
    };

    // 1) Attempt to POST to example Formspree/endpoint (replace with your endpoint)
    const endpoint = 'https://example.com/form-endpoint'; // <- substitute your endpoint (Formspree, Netlify, EmailJS, etc)
    fetch(endpoint, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    }).then(r => {
      // Se endpoint real responder 200, mostrar sucesso
      if (r.ok) return r.json();
      throw new Error('Endpoint não configurado — ver console');
    }).then(resp => {
      alert('Pedido enviado com sucesso! Em breve entraremos em contato.');
      form.reset();
    }).catch(err => {
      // fallback: abrir mailto com conteúdo do formulário
      console.warn('Falha no envio via POST, fallback para email. Erro:', err);
      const subject = encodeURIComponent('Pedido de Agendamento - ' + data.type);
      const body = encodeURIComponent(`Nome: ${data.name}\nWhatsApp: ${data.phone}\nE-mail: ${data.email}\nTipo: ${data.type}\nData: ${data.date}\nHora: ${data.time}\n\nMensagem:\n${data.message}`);
      window.location.href = `mailto:contato@fotografaisa.com?subject=${subject}&body=${body}`;
    });
  });

  // small UX: pause playing videos in slides when slide changes
  const slideVideos = document.querySelectorAll('.slide video');
  function pauseAllSlideVideos(){
    slideVideos.forEach(v => {
      try { v.pause(); v.currentTime = 0; } catch(e) {}
    });
  }
  // pause when changing slide via nav
  leftBtn.addEventListener('click', pauseAllSlideVideos);
  rightBtn.addEventListener('click', pauseAllSlideVideos);

});
