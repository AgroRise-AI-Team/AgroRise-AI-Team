from django.db import migrations, models


def clean_roles(apps, schema_editor):
    UserProfile = apps.get_model('core', 'UserProfile')
    for profile in UserProfile.objects.all():
        if profile.role not in ['FARMER', 'USER']:
            if profile.role in ['BOTH']:
                profile.role = 'FARMER'
            else:
                profile.role = 'USER'
            profile.save(update_fields=['role'])


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_unique_user_email'),
    ]

    operations = [
        migrations.RunPython(clean_roles, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='userprofile',
            name='role',
            field=models.CharField(
                choices=[('FARMER', 'Farmer'), ('USER', 'Normal User')],
                default='FARMER',
                max_length=20
            ),
        ),
    ]
