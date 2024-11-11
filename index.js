const NAV_BAR = document.getElementById('navBar');
const NAV_LIST = document.getElementById('navList');
const HERO_HEADER = document.getElementById('heroHeader');
const HAMBURGER_BTN = document.getElementById('hamburgerBtn');
const NAV_LINKS = Array.from(document.querySelectorAll('.nav__list-link'));
const SERVICE_BOXES = document.querySelectorAll('.service-card__box');
const ACTIVE_LINK_CLASS = 'active';
const BREAKPOINT = 576;

let currentServiceBG = null;
let currentActiveLink = document.querySelector('.nav__list-link.active');

// Remove the active state once the breakpoint is reached
const resetActiveState = () => {
  NAV_LIST.classList.remove('nav--active');
  Object.assign(NAV_LIST.style, {
    height: null
  });
  Object.assign(document.body.style, {
    overflowY: null
  });
}

//Add padding to the header to make it visible because navbar has a fixed position.
const addPaddingToHeroHeaderFn = () => {
  const NAV_BAR_HEIGHT = NAV_BAR.getBoundingClientRect().height;
  const HEIGHT_IN_REM = NAV_BAR_HEIGHT / 10;

  // If hamburger button is active, do not add padding
  if (NAV_LIST.classList.contains('nav--active')) {
    return;
  }
  Object.assign(HERO_HEADER.style, {
    paddingTop: HEIGHT_IN_REM + 'rem'
  });
}
addPaddingToHeroHeaderFn();
window.addEventListener('resize', () => {
  addPaddingToHeroHeaderFn();

  // When the navbar is active and the window is being resized, remove the active state once the breakpoint is reached
  if (window.innerWidth >= BREAKPOINT) {
    addPaddingToHeroHeaderFn();
    resetActiveState();
  }
});

// As the user scrolls, the active link should change based on the section currently displayed on the screen.
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('#heroHeader, #services, #works, #contact');

  // Loop through sections and check if they are visible
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const NAV_BAR_HEIGHT = NAV_BAR.getBoundingClientRect().height;
    if (window.scrollY >= sectionTop - NAV_BAR_HEIGHT) {
      const ID = section.getAttribute('id');
      const LINK = NAV_LINKS.filter(link => {
        return link.href.includes('#' + ID);
      })[0];
      console.log(LINK);
      currentActiveLink.classList.remove(ACTIVE_LINK_CLASS);
      LINK.classList.add(ACTIVE_LINK_CLASS);
      currentActiveLink = LINK;
    }
  });
});

// Shows & hide navbar on smaller screen
HAMBURGER_BTN.addEventListener('click', () => {
  NAV_LIST.classList.toggle('nav--active');
  if (NAV_LIST.classList.contains('nav--active')) {
    Object.assign(document.body.style, {
      overflowY: 'hidden'
    });
    Object.assign(NAV_LIST.style, {
      height: '100vh'
    });
    return;
  }
  Object.assign(NAV_LIST.style, {
    height: 0
  });
  Object.assign(document.body.style, {
    overflowY: null
  });
});

// When navbar link is clicked, reset the active state
NAV_LINKS.forEach(link => {
  link.addEventListener('click', () => {
    resetActiveState();
    link.blur();
  })
})

// Handles the hover animation on services section
SERVICE_BOXES.forEach(service => {
  const moveBG = (x, y) => {
    Object.assign(currentServiceBG.style, {
      left: x + 'px',
      top: y + 'px',
    })
  }
  service.addEventListener('mouseenter', (e) => {
    if (currentServiceBG === null) {
      currentServiceBG = service.querySelector('.service-card__bg');
    }
    moveBG(e.clientX, e.clientY);
  });
  service.addEventListener('mousemove', (e) => {
    const LEFT = e.clientX - service.getBoundingClientRect().left;
    const TOP = e.clientY - service.getBoundingClientRect().top;
    moveBG(LEFT, TOP);
  });
  service.addEventListener('mouseleave', () => {
    const IMG_POS = service.querySelector('.service-card__illustration')
    const LEFT = IMG_POS.offsetLeft + currentServiceBG.getBoundingClientRect().width;
    const TOP = IMG_POS.offsetTop + currentServiceBG.getBoundingClientRect().height;

    moveBG(LEFT, TOP);
    currentServiceBG = null;
  });
});

// Handles smooth scrolling
new SweetScroll({
  trigger: '.nav__list-link',
  easing: 'easeOutQuint',
  offset: NAV_BAR.getBoundingClientRect().height - 80
});






const portfolioModal = document.getElementById('portfolioModal');
const closePortfolioModalButton = document.getElementById('closePortfolioModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalBadges = document.getElementById('modalBadges');
const modalImage = document.getElementById('modalImage'); // New image element
const modalExtraInfo = document.getElementById('modalExtraInfo'); // New extra info list

// Define project details
const portfolioProjects = {
  project1: {
    image: "./assets/images/popup/aerial_popup.jpg",
    title: "Satellite Image Classification with a CNN",
    description: `
            <p>Using a Convolutional Neural Network to classify satellite images into different categories.</p>
            <br>
            <p>The code is entirely written in Python using TensorFlow. I used Google Colab and stored the images in Google Drive.</p>
            <br>
            <p><strong>Image Loading and Augmentation</strong><br>
            To load the images, I used ImageDataGenerators and applied Data Augmentation to reduce overfitting and improve the accuracy of the model.</p>
            <br>
            <p><strong>Model Architecture</strong><br>
            The CNN used is composed of the following layers:</p>
            <br>
            <ul>
                <li>Conv2D with 8 filters and a kernel of 3x3</li>
                <li>ReLU</li>
                <li>MaxPool2D with pool size 2x2</li>
                <li>Conv2D with 16 filters and a kernel of 3x3</li>
                <li>ReLU</li>
                <li>MaxPool2D with pool size 2x2</li>
                <li>Conv2D with 32 filters and a kernel of 3x3</li>
                <li>ReLU</li>
                <li>MaxPool2D with pool size 2x2</li>
                <li>Flatten</li>
                <li>Dense of 300 units with Sigmoid function</li>
                <li>Dense of 21 units with Softmax function</li>
            </ul>
            <br>
            <p>This model reached an accuracy of 82%.</p>
            <br>
            <p><strong>Transfer Learning with InceptionV3</strong><br>
            In the final part of the code, I implemented Transfer Learning using the pre-trained InceptionV3 on ImageNet from Google, achieving an accuracy of 93% on the validation set.</p>
            <br>
            <p><strong>How to Run the Notebook</strong><br>
            We pre-ran the entire notebook and kept the results of the different models. However, to run it yourself, you’ll need to follow these steps:</p>
            <br>
            <ul>
                <li>Upload the folder with the images in your Google Drive under the path: drive/MyDrive/Colab Notebooks/UCMerced_LandUse</li>
                <li>Each section of code is organized into 'Chapters', allowing for independent execution.</li>
            </ul>
            <br>
            <p><strong>Dataset</strong><br>
            <br>
            I used the UC Merced Land Use Dataset, composed of 21 classes, each of 256x256 pixels.</p>
        `,
    badges: ["Python", "TensorFlow"],
    link: "https://github.com/nicolotognoni/Satellite_Image_Classification_CNN"
  },
  project2: {
    image: "./assets/images/popup/stylegan_popup.jpg",
    title: "GAN for Increasing CNN Accuracy",
    description: `
            <p>This project is part of my Master’s thesis, titled: "Using data generated by a GAN to improve the accuracy of a CNN image classification model in the case of a small amount of initial data".</p>
            <br>    
            <p><strong>Abstract</strong><br>
            In certain real-world situations, it’s either impossible or too expensive to gather a huge quantity of data to effectively train deep learning models. The objective of the thesis was to overcome this challenge by using additional data artificially generated by GAN models.</p>
            <br>
            <p>We aimed to see if the additional data created using the initial data would improve the performance of the model.</p>
            <br>
            <p>We expect a threshold in the amount of initial data below which using GAN-generated synthetic data would not be effective. The goal was to find the minimum data needed to improve the CNN model with the help of GANs.</p>
            <br>
            <p><strong>Info</strong></p>
            <br>
            <ul>
                <li><strong>StyleGAN2_ADA.ipynb</strong> - Code to train the StyleGAN model</li>
                <li><strong>generate_synthetic_data.ipynb</strong> - Code to generate synthetic images from a pre-trained StyleGAN model</li>
                <li><strong>CNN.ipynb</strong> - Convolutional Neural Network code to test accuracy before and after adding synthetic images</li>
            </ul>
        `,

    badges: ["Python", "StyleGAN2_ADA"],
    link: "https://github.com/nicolotognoni/GAN_for_increasing_CNN_accuracy"
  },
  project3: {
    image: "./assets/works/sample.png", // Added image for consistency
    title: "My Landing Page",
    description: "Created a landing page using HTML, CSS, and JavaScript to showcase web development skills and user interface design.",
    badges: ["HTML", "CSS", "JavaScript"],
    link: ""
  }
};

function openPortfolioModal(projectId) {
  const project = portfolioProjects[projectId];
  modalTitle.textContent = project.title;
  modalDescription.innerHTML = project.description;
  repositoryLink.href = project.link; // Set link for repository button
  modalImage.src = project.image || '';  // Set image

  // Clear existing badges and add new ones
  modalBadges.innerHTML = '';
  project.badges.forEach(badge => {
    const badgeElem = document.createElement('span');
    badgeElem.className = 'work__badge';
    badgeElem.textContent = badge;
    modalBadges.appendChild(badgeElem);
  });

  portfolioModal.style.display = 'flex';
}


// Close modal on clicking the close button
closePortfolioModalButton.onclick = function () {
  portfolioModal.style.display = 'none';
}

// Close modal when clicking outside of the modal content
window.onclick = function (event) {
  if (event.target == portfolioModal) {
    portfolioModal.style.display = 'none';
  }
}

// Add event listeners to each project box
document.querySelectorAll('.work').forEach((projectBox) => {
  projectBox.addEventListener('click', () => {
    const projectId = projectBox.getAttribute('data-project-id');
    openPortfolioModal(projectId);
  });
});