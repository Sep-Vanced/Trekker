class UserProfileMapper():
    
    @staticmethod
    def map_user_profile(user_profile):
        return {
            'id': user_profile['user'].get('id'),
            'name': f"{user_profile['user'].get('first_name')} {user_profile['user'].get('last_name')}",
            'email': user_profile['user'].get('email'),
            'role': user_profile.get('role'),
            'phone': user_profile.get('phone'),
            'emergency_contact_name': user_profile.get('emergency_contact_name'),
            'emergency_contact_phone': user_profile.get('emergency_contact_phone'),
        }