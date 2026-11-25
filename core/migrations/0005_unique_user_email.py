from django.db import migrations


def clean_duplicate_emails(apps, schema_editor):
    User = apps.get_model('auth', 'User')
    seen = set()
    for user in User.objects.all().order_by('id'):
        if not user.email:
            continue
        lower_email = user.email.strip().lower()
        if lower_email in seen:
            user.email = f"duplicate_{user.id}_{lower_email}"
            user.save(update_fields=['email'])
        else:
            seen.add(lower_email)
            if user.email != lower_email:
                user.email = lower_email
                user.save(update_fields=['email'])


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_alter_userprofile_role'),
    ]

    operations = [
        migrations.RunPython(clean_duplicate_emails, reverse_code=migrations.RunPython.noop),
        migrations.RunSQL(
            sql="""
            CREATE UNIQUE INDEX IF NOT EXISTS auth_user_email_lower_uniq 
            ON auth_user (LOWER(email)) 
            WHERE email <> '';
            """,
            reverse_sql="""
            DROP INDEX IF EXISTS auth_user_email_lower_uniq;
            """
        ),
    ]
