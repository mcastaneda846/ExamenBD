# MegaStore Global - Data Performance & Migration Challenge

This project consists of a full-scale data migration and backend implementation for **MegaStore Global**. The mission was to transition from a disorganized, monolithic Excel-based system to a modern, hybrid persistent architecture (SQL + NoSQL) exposed through a RESTful API.

## Getting Started

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **PostgreSQL / MySQL** instance
* **MongoDB** instance
* **NPM** or **Yarn**

### Installation & Deployment
1. **Clone the repository:**
   ```bash
   git clone https://github.com/mcastaneda846/ExamenBD.git
   cd repository-name


# Enter the project directory
cd proyecto

# Install dependencies

npm install

# Model Justification

I structured the database using both SQL and NoSQL, as I wanted to take advantage of the benefits that both technologies offer. For example, I implemented SQL for the creation of the tables and their respective relationships, since there is a strong presence and dependency between them. I also used NoSQL because it allows me to make general queries and leverage embedded queries, since it allows me to "avoid" queries with joins (more for practical reasons).