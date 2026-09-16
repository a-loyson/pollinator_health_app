from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('uploads', '0002_alter_sighting_prediction'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sighting',
            name='user',
        ),
        migrations.AddField(
            model_name='sighting',
            name='firebase_uid',
            field=models.CharField(default='', max_length=128),
            preserve_default=False,
        ),
    ]
