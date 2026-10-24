from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils.text import slugify
from courses.models import Category, Course, Module, Lesson

User = get_user_model()

class Command(BaseCommand):
    help = "Peuple la base de données avec des catégories, cours et leçons de démonstration pour KAAYNUJÀNG."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Début de l\'injection des données de démonstration...'))

        # 1. Récupérer un utilisateur autorisé (Admin ou Enseignant)
        instructor = User.objects.filter(role__in=['ADMIN', 'ENSEIGNANT']).first()
        if not instructor:
            self.stdout.write(self.style.ERROR('Aucun utilisateur Admin ou Enseignant trouvé dans la BDD.'))
            return

        # 2. Création des Catégories
        categories_data = [
            ("Développement Web & Mobile", "Apprenez les frameworks modernes frontend et backend."),
            ("Data Science & IA", "Maîtrisez le traitement de données, le GIS et le Machine Learning."),
            ("Marketing Digital & Entrepreneuriat", "Lancez et développez des projets à fort impact.")
        ]

        cats = {}
        for nom, desc in categories_data:
            slug = slugify(nom)
            cat, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={'nom': nom, 'description': desc}
            )
            cats[nom] = cat

        # 3. Données des Cours
        courses_data = [
            {
                "category": cats["Développement Web & Mobile"],
                "titre": "Développement Web Moderne avec Django & Angular",
                "description": "Une formation complète pour concevoir des applications web modulaires, sécurisées et performantes de A à Z.",
                "niveau": "INTERMEDIAIRE",
                "modules": [
                    {
                        "titre": "Module 1 : Architecture Backend Django REST",
                        "ordre": 1,
                        "lessons": [
                            {"titre": "Introduction aux APIs REST & JWT", "ordre": 1, "duree_minutes": 25, "type": "VIDEO"},
                            {"titre": "Gestion des rôles et autorisations custom", "ordre": 2, "duree_minutes": 40, "type": "EXERCICE"}
                        ]
                    },
                    {
                        "titre": "Module 2 : Frontend Dynamique avec Angular",
                        "ordre": 2,
                        "lessons": [
                            {"titre": "Composants Standalone et Signals", "ordre": 1, "duree_minutes": 30, "type": "VIDEO"},
                            {"titre": "Intégration d'I18n et Tailwind CSS", "ordre": 2, "duree_minutes": 35, "type": "PDF"}
                        ]
                    }
                ]
            },
            {
                "category": cats["Data Science & IA"],
                "titre": "Analyse de Données Spatiales et Cartographie Web",
                "description": "Initiez-vous au traitement des données vectorielles, à QGIS et à l'intégration de WebGIS pour la gestion urbaine.",
                "niveau": "AVANCE",
                "modules": [
                    {
                        "titre": "Module 1 : Fondamentaux SIG et QGIS",
                        "ordre": 1,
                        "lessons": [
                            {"titre": "Manipulation des tables d'attributs et polygones", "ordre": 1, "duree_minutes": 45, "type": "VIDEO"},
                            {"titre": "Dissolution et catégorisation multi-classes", "ordre": 2, "duree_minutes": 50, "type": "EXERCICE"}
                        ]
                    }
                ]
            },
            {
                "category": cats["Marketing Digital & Entrepreneuriat"],
                "titre": "Marketing Digital & Stratégies d'Acquisition en Afrique de l'Ouest",
                "description": "Stratégies concrètes adaptées aux marchés locaux, au mobile money et aux réseaux sociaux.",
                "niveau": "DEBUTANT",
                "modules": [
                    {
                        "titre": "Module 1 : Stratégie de Contenu Local",
                        "ordre": 1,
                        "lessons": [
                            {"titre": "Optimisation des campagnes WhatsApp & Facebook", "ordre": 1, "duree_minutes": 20, "type": "VIDEO"}
                        ]
                    }
                ]
            }
        ]

        # 4. Injection en base de données
        for c_data in courses_data:
            course_slug = slugify(c_data["titre"])
            course, created = Course.objects.get_or_create(
                slug=course_slug,
                defaults={
                    "titre": c_data["titre"],
                    "categorie": c_data["category"],
                    "enseignant": instructor,
                    "description": c_data["description"],
                    "niveau": c_data["niveau"],
                    "statut": "PUBLIE"
                }
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f' + Cours créé : {course.titre}'))
                for m_data in c_data["modules"]:
                    module, _ = Module.objects.get_or_create(
                        cours=course,
                        titre=m_data["titre"],
                        defaults={"ordre": m_data["ordre"]}
                    )
                    for l_data in m_data["lessons"]:
                        Lesson.objects.get_or_create(
                            module=module,
                            titre=l_data["titre"],
                            defaults={
                                "ordre": l_data["ordre"],
                                "duree_minutes": l_data["duree_minutes"],
                                "type_contenu": l_data["type"],
                                "contenu_texte": "Contenu de cours de démonstration en cours de rédaction."
                            }
                        )

        self.stdout.write(self.style.SUCCESS('Base de données initialisée avec succès avec les cours démo !'))