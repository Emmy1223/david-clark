      // Google Drive Form Endpoint
      const FORM_ENDPOINT =
        "https://script.google.com/macros/s/AKfycbxey1WIuQKzrU03wx37uGxdbfw3FaRJI2nJlUVl-Z2ihaSl2i9Klm1wt9cKX8aipkbUyQ/exec";

      // Page navigation
      function showProject(id) {
        document.getElementById("mainPage").classList.remove("active");
        document.getElementById(id).classList.add("active");
        window.scrollTo(0, 0);
      }
      function showMainPage() {
        document.querySelectorAll(".page").forEach(function (p) {
          p.classList.remove("active");
        });
        document.getElementById("mainPage").classList.add("active");
        window.scrollTo(0, 0);
      }

      // Circuit Board Background
      var canvas = document.getElementById("circuit-layer");
      var ctx = canvas.getContext("2d");
      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resizeCanvas();
      window.addEventListener("resize", function () {
        resizeCanvas();
        generateNodes();
      });
      var nodes = [],
        connections = [];
      function generateNodes() {
        nodes = [];
        connections = [];
        var count = Math.floor((canvas.width * canvas.height) / 18000);
        for (var i = 0; i < count; i++) {
          nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: 1.5 + Math.random() * 2.5,
            pulse: Math.random() * Math.PI * 2,
          });
        }
        for (var i = 0; i < nodes.length; i++) {
          for (var j = i + 1; j < nodes.length; j++) {
            var dx = nodes[i].x - nodes[j].x,
              dy = nodes[i].y - nodes[j].y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 160)
              connections.push({
                from: i,
                to: j,
                opacity: Math.max(0, 1 - dist / 160),
              });
          }
        }
      }
      generateNodes();
      function drawCircuit() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        nodes.forEach(function (n) {
          n.x += n.vx;
          n.y += n.vy;
          n.pulse += 0.02;
          if (n.x < 0) n.x = canvas.width;
          if (n.x > canvas.width) n.x = 0;
          if (n.y < 0) n.y = canvas.height;
          if (n.y > canvas.height) n.y = 0;
        });
        connections.forEach(function (c) {
          var f = nodes[c.from],
            t = nodes[c.to];
          ctx.strokeStyle = "rgba(0, 255, 65, " + c.opacity * 0.3 + ")";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(f.x, f.y);
          ctx.lineTo(t.x, t.y);
          ctx.stroke();
        });
        nodes.forEach(function (n) {
          var pa = 0.4 + Math.sin(n.pulse) * 0.3;
          var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size * 3);
          g.addColorStop(0, "rgba(0, 255, 65, " + pa + ")");
          g.addColorStop(1, "rgba(0, 255, 65, 0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(0, 255, 65, " + (pa + 0.2) + ")";
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fill();
        });
        requestAnimationFrame(drawCircuit);
      }
      drawCircuit();

      // Theme Toggle
      var themeToggle = document.getElementById("themeToggle");
      var html = document.documentElement;
      var savedTheme = localStorage.getItem("theme") || "dark";
      html.setAttribute("data-theme", savedTheme);
      themeToggle.addEventListener("click", function () {
        var c = html.getAttribute("data-theme");
        var n = c === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", n);
        localStorage.setItem("theme", n);
      });

      // Collapsible experience cards
      document.querySelectorAll(".exp-card").forEach(function (card) {
        function toggleCard() {
          var o = card.classList.contains("open");
          card.classList.toggle("open");
          card.setAttribute("aria-expanded", !o);
        }
        card.addEventListener("click", toggleCard);
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleCard();
          }
        });
      });

      // Contact Form
      var contactForm = document.getElementById("contactForm");
      var successMsg = document.getElementById("contactSuccess");
      var errorMsg = document.getElementById("contactError");
      var submitBtn = document.getElementById("submitBtn");
      var submitText = document.getElementById("submitText");
      var submitLoader = document.getElementById("submitLoader");
      var formName = document.getElementById("formName");
      var formEmail = document.getElementById("formEmail");
      var formSubject = document.getElementById("formSubject");
      var formMessage = document.getElementById("formMessage");

      function showError(input, show) {
        if (show) {
          input.classList.add("error");
        } else {
          input.classList.remove("error");
        }
      }
      function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      }
      function setLoading(state) {
        submitBtn.disabled = state;
        submitText.style.display = state ? "none" : "inline";
        submitLoader.style.display = state ? "inline" : "none";
      }

      contactForm.onsubmit = function (e) {
        e.preventDefault();

        var formData = {
          name: formName.value.trim(),
          email: formEmail.value.trim(),
          subject: formSubject.value.trim(),
          message: formMessage.value.trim(),
          timestamp: new Date().toISOString(),
        };

        // Basic required validation (HTML required is present, but keep UX consistent)
        if (!formData.name) return;
        if (!formData.email || !validateEmail(formData.email)) return;
        if (!formData.subject) return;
        if (!formData.message) return;

        setLoading(true);
        successMsg.classList.remove("show");
        errorMsg.classList.remove("show");

        // Google Apps Script web app may not send CORS headers.
        // no-cors will make response opaque, so we show success if the request does not throw.
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          mode: "no-cors",
        })
          .then(function () {
            successMsg.classList.add("show");
            contactForm.reset();
            setTimeout(function () {
              successMsg.classList.remove("show");
            }, 4000);
          })
          .catch(function (err) {
            console.error("Form error:", err);
            errorMsg.classList.add("show");
            setTimeout(function () {
              errorMsg.classList.remove("show");
            }, 5000);
          })
          .finally(function () {
            setLoading(false);
          });

        return false;
      };

      formName.addEventListener("input", function () {
        showError(formName, false);
      });
      formEmail.addEventListener("input", function () {
        showError(formEmail, false);
      });
      formSubject.addEventListener("input", function () {
        showError(formSubject, false);
      });
      formMessage.addEventListener("input", function () {
        showError(formMessage, false);
      });

      // AI Chatbot
      var aiChatBtn = document.getElementById("aiChatBtn");
      var aiChatPanel = document.getElementById("aiChatPanel");
      var aiChatClose = document.getElementById("aiChatClose");
      var aiChatMessages = document.getElementById("aiChatMessages");
      var aiChatInput = document.getElementById("aiChatInput");
      var aiChatSend = document.getElementById("aiChatSend");

      var pd = {
        name: "David Clark",
        email: "david.clark67@outlook.com",
        phone: "(650) 530-0517",
        location: "Rochester, MN",
        currentRole: {
          title: "Principal AI Platform Engineer",
          company: "PredictHQ",
        },
        projects: [
          { name: "Event Intelligence Pipeline" },
          { name: "RAG System" },
          { name: "Feature Engineering Platform" },
        ],
        skills: [
          "AI/ML: RAG, LLMs, PyTorch, TensorFlow, NLP",
          "Languages: Python, TypeScript, JavaScript, Go, Java",
        ],
      };

      function fa(q) {
        q = q.toLowerCase();
        if (q.includes("contact") || q.includes("email"))
          return "Reach David at " + pd.email + " or " + pd.phone + ".";
        if (q.includes("current") || q.includes("predicthq"))
          return pd.currentRole.title + " at " + pd.currentRole.company + ".";
        if (q.includes("experience"))
          return "10 years: Trbhi → Prezi → PredictHQ.";
        if (q.includes("project"))
          return (
            "3 projects: " +
            pd.projects
              .map(function (p) {
                return p.name;
              })
              .join(", ") +
            "."
          );
        if (q.includes("skill") || q.includes("stack"))
          return "Stack: " + pd.skills.join("; ") + ".";
        if (q.includes("hire") || q.includes("available"))
          return "Open to Principal/Staff-level AI platform roles.";
        return "Ask me about David's experience, skills, or projects.";
      }

      function am(t, ty) {
        var m = document.createElement("div");
        m.className = "ai-message " + ty;
        m.textContent = t;
        aiChatMessages.appendChild(m);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
      }

      function ati() {
        // Prevent multiple typing indicators when user sends quickly
        rti();
        var t = document.createElement("div");
        t.className = "ai-typing-indicator";
        t.id = "typingIndicator";
        t.innerHTML = "<span></span><span></span><span></span>";
        aiChatMessages.appendChild(t);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
      }

      function rti() {
        var t = document.getElementById("typingIndicator");
        if (t) t.remove();
      }

      function hs() {
        var q = aiChatInput.value.trim();
        if (!q) return;
        am(q, "user");
        aiChatInput.value = "";
        ati();
        setTimeout(
          function () {
            rti();
            am(fa(q), "bot");
          },
          800 + Math.random() * 600,
        );
      }

      aiChatBtn.addEventListener("click", function () {
        aiChatPanel.classList.toggle("open");
        if (aiChatPanel.classList.contains("open")) aiChatInput.focus();
      });
      aiChatClose.addEventListener("click", function (e) {
        e.stopPropagation();
        aiChatPanel.classList.remove("open");
      });
      aiChatSend.addEventListener("click", hs);
      aiChatInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          hs();
        }
      });
      document.addEventListener("click", function (e) {
        if (!e.target.closest(".ai-chat-wrapper"))
          aiChatPanel.classList.remove("open");
      });

      // Scroll indicator
      var si = document.querySelector(".scroll-indicator");
      if (si)
        window.addEventListener("scroll", function () {
          si.style.opacity = window.scrollY > 100 ? "0" : "1";
          si.style.transition = "opacity 0.3s ease";
        });

      // Animated counting
      function ac(el) {
        var t = parseInt(el.dataset.target),
          s = el.dataset.suffix || "",
          p = el.dataset.prefix || "",
          st = performance.now();
        function u(ct) {
          var pr = Math.min((ct - st) / 2000, 1),
            c = Math.floor(t * (1 - Math.pow(1 - pr, 3)));
          el.textContent = p + c + s;
          if (pr < 1) requestAnimationFrame(u);
        }
        requestAnimationFrame(u);
      }
      var ob = new IntersectionObserver(
        function (e) {
          e.forEach(function (en) {
            if (en.isIntersecting) {
              en.target.querySelectorAll(".stat-number").forEach(function (n) {
                ac(n);
              });
              ob.unobserve(en.target);
            }
          });
        },
        { threshold: 0.5 },
      );
      var sg = document.querySelector(".stats-grid");
      if (sg) ob.observe(sg);